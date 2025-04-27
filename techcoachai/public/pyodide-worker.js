// This is a simple worker that will load Pyodide
importScripts('https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js');

async function loadPyodideAndPackages() {
  try {
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackagesFromImports('micropip');
    self.postMessage({ type: 'ready' });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}

loadPyodideAndPackages();

// Track user namespace
let userNamespace = null;

self.onmessage = async (event) => {
  if (!self.pyodide) {
    self.postMessage({ type: 'error', error: 'Pyodide not loaded yet' });
    return;
  }

  const { id, python, reset } = event.data;

  try {
    // Reset the Python environment if requested or if it's a new execution
    if (reset || !userNamespace) {
      // Create a fresh namespace for each execution to prevent state from persisting
      userNamespace = self.pyodide.globals.get("dict")();

      // Initialize the namespace with basic modules
      await self.pyodide.runPythonAsync(`
import sys
from io import StringIO
import builtins
      `, { globals: userNamespace });
    }

    // Execute with output redirection in the isolated namespace
    await self.pyodide.runPythonAsync(`
class StdCapture:
    def __init__(self):
        self.stdout = StringIO()

    def __enter__(self):
        sys.stdout = self.stdout
        return self.stdout

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = sys.__stdout__

with StdCapture() as output:
    try:
${python.split('\n').map(line => '        ' + line).join('\n')}
    except Exception as e:
        print(f"Error: {type(e).__name__}: {str(e)}")

captured_output = output.getvalue()
    `, { globals: userNamespace });

    // Get the output from the isolated namespace
    const output = userNamespace.get('captured_output');

    self.postMessage({
      type: 'result',
      id,
      output
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message
    });
  }
};
