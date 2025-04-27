import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from './ui/button';
import { useTheme } from '../lib/themeContext';
import { RotateCcw, Send, Play } from 'lucide-react';
import { useProblem } from '../lib/problemContext';
import { useAuth } from '../lib/authContext';

interface CodeEditorProps {
  initialCode?: string;
  problemId: string;
  onCodeChange?: (code: string) => void;
  onSubmitResult?: (testResults: string, passed: boolean) => void;
}

export function CodeEditor({
  initialCode = '# Write your Python code here\n',
  problemId,
  onCodeChange,
  onSubmitResult
}: CodeEditorProps) {
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { markProblemCompleted, isProblemCompleted } = useProblem();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('Loading Python environment...');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{passed: boolean, message: string} | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const taskIdCounter = useRef(0);
  const pendingTasks = useRef<Map<number, (result: string) => void>>(new Map());
  const isCompletedRef = useRef(isProblemCompleted(problemId));
  const initialLoadRef = useRef(true);
  const onCodeChangeRef = useRef(onCodeChange);
  const codeRef = useRef(code);
  // Store the current user ID for comparison
  const userIdRef = useRef<string | null>(isAuthenticated ? user?.id || null : null);

  // Add a reference to track the current problem ID for resets
  const prevProblemIdRef = useRef<string>(problemId);

  // Update refs when props/state change
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Handle user changes - this is critical for isolating user sessions
  useEffect(() => {
    const currentUserId = isAuthenticated ? user?.id || null : null;

    // If the user has changed (login/logout/switch user)
    if (userIdRef.current !== currentUserId) {
      console.log('User changed, resetting editor state');

      // Reset the editor to initial state when user changes
      setCode(initialCode);
      setTestResults(null);

      // Reset the Python worker to clear any state
      if (workerRef.current) {
        // Send a reset command to the worker
        workerRef.current.postMessage({
          id: taskIdCounter.current++,
          python: '# Reset environment',
          reset: true
        });
      }

      initialLoadRef.current = true;
      userIdRef.current = currentUserId;
    }
  }, [user, isAuthenticated, initialCode]);

  // Load code from localStorage if exists - only on initial mount or problemId change
  useEffect(() => {
    // Only load code from localStorage if a user is authenticated
    if (isAuthenticated && user) {
      // Use user-specific storage key
      const storageKey = `code-${user.id}-${problemId}`;
      const savedCode = localStorage.getItem(storageKey);

      if (savedCode && initialLoadRef.current) {
        setCode(savedCode);
        // Call onCodeChange with the loaded code, but only once
        if (onCodeChangeRef.current) {
          onCodeChangeRef.current(savedCode);
        }
      } else if (!savedCode) {
        // If no saved code, reset to initial code
        setCode(initialCode);
      }
    } else {
      // If not authenticated, ensure we're using the initial code
      setCode(initialCode);
    }

    initialLoadRef.current = false;

    // Reset flags when problem changes
    return () => {
      initialLoadRef.current = true;
    };
  }, [problemId, isAuthenticated, user, initialCode]);

  // Save code to localStorage when it changes
  useEffect(() => {
    if (!initialLoadRef.current && isAuthenticated && user) {
      // Use user-specific storage key
      const storageKey = `code-${user.id}-${problemId}`;
      localStorage.setItem(storageKey, code);
    }
  }, [code, problemId, isAuthenticated, user]);

  // Handle code changes from the editor - use memoized callback to prevent recreating on every render
  const handleCodeChange = React.useCallback((value: string) => {
    setCode(value);
    // Clear test results when code changes
    setTestResults(null);

    // Call onCodeChange to propagate the code change, but only if we're not in the initial load
    if (!initialLoadRef.current && onCodeChangeRef.current) {
      onCodeChangeRef.current(value);
    }
  }, []); // Empty dependency array since we use refs

  // Initialize the worker
  useEffect(() => {
    // Create the worker
    const worker = new Worker('/pyodide-worker.js');

    // Set up message handling
    worker.onmessage = (event) => {
      const { type, id, output, error } = event.data;

      if (type === 'ready') {
        setPyodideReady(true);
        setOutput('Python environment loaded. Click "Run" to execute your code.');
      }
      else if (type === 'result' && id !== undefined) {
        const resolve = pendingTasks.current.get(id);
        if (resolve) {
          resolve(output || '');
          pendingTasks.current.delete(id);
        }
      }
      else if (type === 'error') {
        if (id !== undefined) {
          const resolve = pendingTasks.current.get(id);
          if (resolve) {
            resolve(`Error: ${error}`);
            pendingTasks.current.delete(id);
          }
        } else {
          setOutput(`Failed to load Python environment: ${error}`);
          setPyodideReady(false);
        }
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setOutput(`Worker error: ${error.message}`);
      setPyodideReady(false);
    };

    // Store the worker reference
    workerRef.current = worker;

    // Clean up on component unmount
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Function to run code in the worker
  const runPythonInWorker = (pythonCode: string, shouldReset: boolean = false): Promise<string> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve('Worker not initialized');
        return;
      }

      const id = taskIdCounter.current++;
      pendingTasks.current.set(id, resolve);

      workerRef.current.postMessage({
        id,
        python: pythonCode,
        reset: shouldReset // Pass the reset flag to the worker
      });
    });
  };

  // Function to run the Python code
  const runCode = async () => {
    if (!pyodideReady || !workerRef.current) {
      setOutput('Python environment is still loading. Please wait...');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');
    setTestResults(null);

    // Check if problem ID has changed, which would require a reset
    const shouldReset = prevProblemIdRef.current !== problemId;
    if (shouldReset) {
      prevProblemIdRef.current = problemId;
    }

    try {
      const result = await runPythonInWorker(codeRef.current, shouldReset);
      setOutput(result || 'Code executed successfully with no output.');
    } catch (error) {
      console.error('Execution error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setOutput(`Error executing code: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Function to reset the code to its initial state
  const resetCode = () => {
    setCode(initialCode);
    setOutput('Code has been reset to the initial template.');
    setTestResults(null);
    if (onCodeChangeRef.current) {
      onCodeChangeRef.current(initialCode);
    }
  };

  // Function to submit the code for evaluation
  const submitCode = async () => {
    if (!pyodideReady || !workerRef.current) {
      setOutput('Python environment is still loading. Please wait...');
      return;
    }

    setIsSubmitting(true);
    setOutput('Submitting and running tests...');
    setTestResults(null);

    // Always reset the Python environment for submission to ensure clean state
    const shouldReset = true;

    try {
      // Construct test code based on the problem ID
      let testCode = '';

      // Common test setup
      testCode += `
# Original user code
${codeRef.current}

# Test framework
import sys
from io import StringIO

# Capture output for testing
original_stdout = sys.stdout
sys.stdout = StringIO()

try:
`;

      // Problem-specific test cases
      if (problemId === '1') {  // Hello World
        testCode += `
    # Test case for Hello World problem
    def test_hello_world():
        try:
            # Check if 'hello_world' function exists
            if 'hello_world' not in globals() and 'hello_world' not in locals():
                return "FAIL: Could not find a 'hello_world' function in your code. Make sure you've defined it correctly."

            # Run the function and check the result
            result = hello_world()
            expected = "Hello, World!"

            if result != expected:
                return f"FAIL: Expected exactly '{expected}', but got '{result}'"

            return "PASS: Your hello_world function correctly returns 'Hello, World!'"
        except Exception as e:
            return f"FAIL: Error when testing your code: {str(e)}"

    print(test_hello_world())
`;
      } else if (problemId === '2') {  // Reverse a String
        testCode += `
    # Test case for Reverse a String problem
    def test_reverse_string():
        try:
            # Check if 'reverse_string' function exists
            if 'reverse_string' not in globals() and 'reverse_string' not in locals():
                return "FAIL: Could not find a 'reverse_string' function in your code"

            test_cases = [
                {"input": "hello", "expected": "olleh"},
                {"input": "Python", "expected": "nohtyP"},
                {"input": "", "expected": ""}
            ]

            for tc in test_cases:
                result = reverse_string(tc["input"])
                if result != tc["expected"]:
                    return f"FAIL: For input '{tc['input']}', expected '{tc['expected']}', but got '{result}'"

            return "PASS: All test cases passed for reverse_string!"
        except Exception as e:
            return f"FAIL: Error when testing your code: {str(e)}"

    print(test_reverse_string())
`;
      } else if (problemId === '3') {  // Sum of a List
        testCode += `
    # Test case for Sum of a List problem
    def test_sum_list():
        try:
            # Check if 'sum_list' function exists
            if 'sum_list' not in globals() and 'sum_list' not in locals():
                return "FAIL: Could not find a 'sum_list' function in your code"

            test_cases = [
                {"input": [1, 2, 3, 4, 5], "expected": 15},
                {"input": [-1, 0, 1], "expected": 0},
                {"input": [], "expected": 0}
            ]

            for tc in test_cases:
                result = sum_list(tc["input"])
                if result != tc["expected"]:
                    return f"FAIL: For input {tc['input']}, expected {tc['expected']}, but got {result}"

            return "PASS: All test cases passed for sum_list!"
        except Exception as e:
            return f"FAIL: Error when testing your code: {str(e)}"

    print(test_sum_list())
`;

      } else if (problemId === '5') {  // Sort a List
        testCode += `
    # Test case for Sort a List problem
    def test_sort_list():
        try:
            if 'sort_list' not in globals():
                return "FAIL: Missing function 'sort_list'"

            # Verify function signature
            import inspect
            sig = inspect.signature(sort_list)
            params = list(sig.parameters.keys())
            if len(params) < 1 or len(params) > 2:
                return "FAIL: Function must take 1-2 parameters"

            # Test cases
            test_cases = [
                ([3, 1, 4, 1, 5], [1, 1, 3, 4, 5]),
                ([], []),
                ([-5, -1, -3], [-5, -3, -1])
            ]

            for input_list, expected in test_cases:
                original = input_list.copy()
                result = sort_list(input_list)
                if result != expected:
                    return f"FAIL: Input {input_list}: Expected {expected}, got {result}"
                if input_list != original:
                    return "FAIL: Original list was modified"

            return "PASS: All tests passed!"
        except Exception as e:
            return f"FAIL: Runtime error: {str(e)}"

    print(test_sort_list())
`;
      } else if (problemId === '18') {  // Word Counter
  testCode += `
    def test_word_count():
        try:
            # Required test cases from problem description
            test_cases = [
                ("Hello world, hello Python!", 
                 {"hello": 2, "world": 1, "python": 1}),
                ("The quick brown fox jumps over the lazy dog.",
                 {"the": 2, "quick": 1, "brown": 1, "fox": 1, 
                  "jumps": 1, "over": 1, "lazy": 1, "dog": 1})
            ]
            
            # Verify function exists
            if 'word_count' not in globals():
                return "FAIL: Function 'word_count' not defined"
                
            # Test each required case
            for text, expected in test_cases:
                result = word_count(text)
                
                if not isinstance(result, dict):
                    return "FAIL: Function should return a dictionary"
                
                if result != expected:
                    return f"FAIL: For input '{text}', expected {expected}, got {result}"
            
            # Basic additional checks (only what's specified in constraints)
            if word_count("") != {}:
                return "FAIL: Empty string should return empty dictionary"
                
            # Case insensitivity check
            if word_count("Hello HELLO hello") != {"hello": 3}:
                return "FAIL: Should be case insensitive"
                
            # Punctuation check (from examples)
            if word_count("word! word? word.") != {"word": 3}:
                return "FAIL: Should ignore punctuation"
            
            return "PASS: All requirements satisfied"
        except Exception as e:
            return f"FAIL: Error during execution - {str(e)}"
    print(test_word_count())
  `;
      } else if (problemId === '23') {  // String Case Converter
    testCode += `
      def test_convert_case():
          try:
              # Required test cases from problem description
              test_cases = [
                  ("Hello World", "upper", "HELLO WORLD"),
                  ("Hello World", "lower", "hello world"),
                  ("hello world", "title", "Hello World"),
                  ("Hello World", "invalid", "Hello World"),
                  ("", "upper", ""),
                  ("python programming", "title", "Python Programming")
              ]
              
              # Verify function exists
              if 'convert_case' not in globals():
                  return "FAIL: Function 'convert_case' not defined"
                  
              # Test each required case
              for text, case_type, expected in test_cases:
                  result = convert_case(text, case_type)
                  
                  if result != expected:
                      return f"FAIL: Input ('{text}', '{case_type}') expected '{expected}', got '{result}'"
              
              # Additional basic checks
              if convert_case("multi word string", "title") != "Multi Word String":
                  return "FAIL: Title case should capitalize each word"
                  
              if convert_case("123 numbers", "upper") != "123 NUMBERS":
                  return "FAIL: Should handle numbers correctly"
              
              return "PASS: All requirements satisfied"
          except Exception as e:
              return f"FAIL: Error during execution - {str(e)}"
      print(test_convert_case())
    `;

      } else if (problemId === '4') {  // Palindrome Checker
        testCode += `
    # Test case for Palindrome Checker problem
    def test_is_palindrome():
        try:
            # Check if 'is_palindrome' function exists
            if 'is_palindrome' not in globals() and 'is_palindrome' not in locals():
                return "FAIL: Could not find an 'is_palindrome' function in your code"

            test_cases = [
                {"input": "racecar", "expected": True},
                {"input": "hello", "expected": False},
                {"input": "A man, a plan, a canal, Panama", "expected": True},
                {"input": "", "expected": True}
            ]

            for tc in test_cases:
                result = is_palindrome(tc["input"])
                if result != tc["expected"]:
                    return f"FAIL: For input '{tc['input']}', expected {tc['expected']}, but got {result}"

            return "PASS: All test cases passed for is_palindrome!"
        except Exception as e:
            return f"FAIL: Error when testing your code: {str(e)}"

    print(test_is_palindrome())

`;
      }else if (problemId === '19') {  // Tower of Hanoi
  testCode += `
    def test_hanoi():
        try:
            # Setup to capture printed output
            import sys
            from io import StringIO
            old_stdout = sys.stdout
            sys.stdout = StringIO()

            # Run the function
            hanoi(3, "A", "B", "C")
            
            # Get and reset output
            output = sys.stdout.getvalue().strip()
            sys.stdout = old_stdout
            
            # Expected moves for n=3
            expected_moves = [
                "Move disk 1 from A to C",
                "Move disk 2 from A to B",
                "Move disk 1 from C to B",
                "Move disk 3 from A to C",
                "Move disk 1 from B to A",
                "Move disk 2 from B to C",
                "Move disk 1 from A to C"
            ]
            
            # Verify function exists
            if 'hanoi' not in globals():
                return "FAIL: Function 'hanoi' not defined"
                
            # Split output into lines
            moves = [line.strip() for line in output.split('\\n') if line.strip()]
            
            # Check move count (should be 2^n - 1 moves)
            if len(moves) != 7:
                return f"FAIL: Expected 7 moves for 3 disks, got {len(moves)}"
            
            # Verify each move
            for i, (actual, expected) in enumerate(zip(moves, expected_moves)):
                if actual != expected:
                    return f"FAIL: Move {i+1} incorrect\\nExpected: {expected}\\nGot: {actual}"
            
            # Verify no disk is placed on smaller disk (simulated check)
            rods = {'A': [], 'B': [], 'C': []}
            rods['A'] = [3,2,1]  # Initial state
            
            for move in moves:
                parts = move.split()
                disk = int(parts[2])
                from_rod = parts[4]
                to_rod = parts[6]
                
                # Verify disk is the top one
                if rods[from_rod][-1] != disk:
                    return f"FAIL: Invalid move - Disk {disk} not top of {from_rod}"
                
                # Verify no larger disk is below
                if rods[to_rod] and rods[to_rod][-1] < disk:
                    return f"FAIL: Invalid move - Cannot place disk {disk} on {rods[to_rod][-1]}"
                
                # Update rod states
                rods[from_rod].pop()
                rods[to_rod].append(disk)
            
            return "PASS: All moves valid and correct"
        except Exception as e:
            return f"FAIL: Error during execution - {str(e)}"
    print(test_hanoi())
  `;

      }else if (problemId === '9') {  // Find the GCD
  testCode += `
    def test_gcd():
        try:
            # Required test cases from problem description
            test_cases = [
                ((56, 98), 14),
                ((17, 23), 1),
                ((0, 5), 5),
                ((48, 18), 6)
            ]
            
            # Verify function exists
            if 'gcd' not in globals():
                return "FAIL: Function 'gcd' not defined"
                
            # Test each required case
            for (a, b), expected in test_cases:
                result = gcd(a, b)
                
                if result != expected:
                    return f"FAIL: gcd({a}, {b}) expected {expected}, got {result}"
            
            # Additional validation
            if gcd(0, 0) != 0:
                return "FAIL: gcd(0, 0) should return 0"
                
            if gcd(12, 18) != 6:
                return "FAIL: gcd(12, 18) should return 6"
                
            if gcd(1, 1) != 1:
                return "FAIL: gcd(1, 1) should return 1"
            
            # Verify it can handle large inputs
            try:
                if gcd(123456, 987654) != 6:
                    return "FAIL: gcd(123456, 987654) gave incorrect result"
            except:
                return "FAIL: Function failed on large inputs"
            
            return "PASS: All requirements satisfied"
        except Exception as e:
            return f"FAIL: Error during execution - {str(e)}"
    print(test_gcd())
  `;

      }else if (problemId === '8') {  // Fibonacci Sequence
  testCode += `
    def test_fibonacci():
        try:
            # Required test cases from problem description
            test_cases = [
                (1, 0),
                (2, 1),
                (7, 8),
                (10, 34)
            ]
            
            # Verify function exists
            if 'fibonacci' not in globals():
                return "FAIL: Function 'fibonacci' not defined"
                
            # Test each required case
            for n, expected in test_cases:
                result = fibonacci(n)
                
                if result != expected:
                    return f"FAIL: fibonacci({n}) expected {expected}, got {result}"
            
            # Additional validation
            if fibonacci(3) != 1:
                return "FAIL: fibonacci(3) should return 1"
                
            if fibonacci(4) != 2:
                return "FAIL: fibonacci(4) should return 2"
                
            if fibonacci(5) != 3:
                return "FAIL: fibonacci(5) should return 3"
            
            # Verify it can handle at least fibonacci(30)
            try:
                if fibonacci(30) != 514229:
                    return "FAIL: fibonacci(30) gave incorrect result"
            except:
                return "FAIL: Function failed on large input (fibonacci(30))"
            
            return "PASS: All requirements satisfied"
        except Exception as e:
            return f"FAIL: Error during execution - {str(e)}"
    print(test_fibonacci())
  `;

      }else if (problemId === '7') {  // Factorial Calculation
  testCode += `
    def test_factorial():
        try:
            # Required test cases from problem description
            test_cases = [
                (5, 120),
                (0, 1),
                (1, 1),
                (10, 3628800)
            ]
            
            # Verify function exists
            if 'factorial' not in globals():
                return "FAIL: Function 'factorial' not defined"
                
            # Test each required case
            for n, expected in test_cases:
                result = factorial(n)
                
                if result != expected:
                    return f"FAIL: factorial({n}) expected {expected}, got {result}"
            
            # Additional edge cases
            if factorial(2) != 2:
                return "FAIL: factorial(2) should return 2"
                
            if factorial(3) != 6:
                return "FAIL: factorial(3) should return 6"
            
            # Verify it can handle at least factorial(20)
            try:
                large_result = factorial(20)
                if large_result != 2432902008176640000:
                    return "FAIL: factorial(20) gave incorrect result"
            except:
                return "FAIL: Function failed on large input (factorial(20))"
            
            return "PASS: All requirements satisfied"
        except Exception as e:
            return f"FAIL: Error during execution - {str(e)}"
    print(test_factorial())
  `;
      }else if (problemId === '10') {  // FizzBuzz
    testCode += `
      def test_fizzbuzz():
          try:
              # Required test case from problem description
              expected_output = [
                  "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", 
                  "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"
              ]
              
              # Verify function exists
              if 'fizzbuzz' not in globals():
                  return "FAIL: Function 'fizzbuzz' not defined"
                  
              # Test the main case
              result = fizzbuzz(15)
              
              if not isinstance(result, list):
                  return "FAIL: Function should return a list"
                  
              if len(result) != 15:
                  return f"FAIL: Expected 15 elements, got {len(result)}"
              
              for i in range(15):
                  expected = expected_output[i]
                  actual = result[i]
                  if actual != expected:
                      return f'''FAIL: At position {i+1}
  Expected: {expected}
  Got: {actual}'''
              
              # Additional validation
              test_cases = [
                  (1, ["1"]),
                  (3, ["1", "2", "Fizz"]),
                  (5, ["1", "2", "Fizz", "4", "Buzz"]),
                  (16, expected_output + ["16"])
              ]
              
              for n, expected in test_cases:
                  actual = fizzbuzz(n)
                  if actual != expected:
                      return f"FAIL: fizzbuzz({n}) gave incorrect output"
              
              # Verify FizzBuzz is only for multiples of 15
              if "FizzBuzz" in fizzbuzz(14):
                  return "FAIL: Found FizzBuzz when shouldn't exist"
                  
              # Verify numbers not divisible by 3 or 5 are strings
              if not all(isinstance(x, str) for x in fizzbuzz(2)):
                  return "FAIL: All elements should be strings"
              
              return "PASS: All FizzBuzz requirements satisfied"
          except Exception as e:
              return f"FAIL: Error during execution - {str(e)}"
      print(test_fizzbuzz())
    `;
      }else if (problemId === '11') {  // Prime Number Checker
      testCode += `
        def test_is_prime():
            try:
                # Required test cases from problem description
                test_cases = [
                    (7, True),
                    (4, False),
                    (1, False),
                    (29, True),
                    (100, False)
                ]
                
                # Verify function exists
                if 'is_prime' not in globals():
                    return "FAIL: Function 'is_prime' not defined"
                    
                # Test each required case
                for n, expected in test_cases:
                    result = is_prime(n)
                    
                    if result != expected:
                        return f"FAIL: is_prime({n}) expected {expected}, got {result}"
                
                # Additional validation
                edge_cases = [
                    (2, True),   # Smallest prime
                    (3, True),   # Smallest odd prime
                    (9, False),  # Square of prime
                    (15, False), # Product of primes
                    (7919, True) # Large prime
                ]
                
                for n, expected in edge_cases:
                    if is_prime(n) != expected:
                        return f"FAIL: is_prime({n}) should be {expected}"
                
                # Verify it can handle at least up to 10,000
                try:
                    if not is_prime(9973):
                        return "FAIL: 9973 should be prime"
                    if is_prime(9999):
                        return "FAIL: 9999 should not be prime"
                except:
                    return "FAIL: Function failed on large input"
                
                return "PASS: All prime number checks correct"
            except Exception as e:
                return f"FAIL: Error during execution - {str(e)}"
        print(test_is_prime())
      `;

      } else if (problemId === '20') {  // Matrix Operations
        testCode += `
          # Matrix Operations Test
          def test_matrix_ops():
              try:
                  # Test matrix addition
                  A = [[1, 2], [3, 4]]
                  B = [[5, 6], [7, 8]]
                  expected_add = [[6, 8], [10, 12]]
                  
                  if 'matrix_add' not in globals():
                      return "FAIL: matrix_add function not found"
                  
                  add_result = matrix_add(A, B)
                  if add_result != expected_add:
                      return f"FAIL: Addition incorrect. Expected {expected_add}, got {add_result}"
                  
                  # Test matrix multiplication
                  expected_mult = [[19, 22], [43, 50]]
                  
                  if 'matrix_multiply' not in globals():
                      return "FAIL: matrix_multiply function not found"
                  
                  mult_result = matrix_multiply(A, B)
                  if mult_result != expected_mult:
                      return f"FAIL: Multiplication incorrect. Expected {expected_mult}, got {mult_result}"
                  
                  # Test matrix transpose
                  C = [[1, 2, 3], [4, 5, 6]]
                  expected_trans = [[1, 4], [2, 5], [3, 6]]
                  
                  if 'matrix_transpose' not in globals():
                      return "FAIL: matrix_transpose function not found"
                  
                  trans_result = matrix_transpose(C)
                  if trans_result != expected_trans:
                      return f"FAIL: Transpose incorrect. Expected {expected_trans}, got {trans_result}"
                  
                  # Additional validation
                  # Test empty matrix
                  if matrix_add([[]], [[]]) != [[]]:
                      return "FAIL: Empty matrix addition failed"
                  
                  # Test 1x1 matrices
                  if matrix_multiply([[2]], [[3]]) != [[6]]:
                      return "FAIL: 1x1 matrix multiplication failed"
                  
                  return "PASS: All matrix operations correct"
              except Exception as e:
                  return f"FAIL: Error during testing - {str(e)}"
          
          print(test_matrix_ops())

        `;

      }else if (problemId === '12') {  // Stack Implementation
          testCode += `
            def test_stack_implementation():
                try:
                    # Verify Stack class exists
                    if 'Stack' not in globals():
                        return "FAIL: Stack class not defined"
                    
                    # Test initialization
                    stack = Stack()
                    if not stack.is_empty():
                        return "FAIL: New stack should be empty"
                    
                    if stack.size() != 0:
                        return "FAIL: New stack size should be 0"
                    
                    # Test push and peek
                    stack.push(1)
                    if stack.peek() != 1:
                        return "FAIL: peek() should return 1 after pushing 1"
                    
                    if stack.size() != 1:
                        return "FAIL: size() should be 1 after one push"
                        
                    # Test multiple pushes
                    stack.push(2)
                    stack.push(3)
                    if stack.peek() != 3:
                        return "FAIL: peek() should return 3 after pushing 2 then 3"
                    
                    if stack.size() != 3:
                        return "FAIL: size() should be 3 after three pushes"
                    
                    # Test pop
                    if stack.pop() != 3:
                        return "FAIL: First pop() should return 3"
                    
                    if stack.pop() != 2:
                        return "FAIL: Second pop() should return 2"
                    
                    if stack.size() != 1:
                        return "FAIL: size() should be 1 after two pops"
                    
                    # Test empty stack errors
                    empty_stack = Stack()
                    try:
                        empty_stack.pop()
                        return "FAIL: pop() should raise error on empty stack"
                    except IndexError:
                        pass
                    except:
                        return "FAIL: pop() should raise IndexError on empty stack"
                    
                    try:
                        empty_stack.peek()
                        return "FAIL: peek() should raise error on empty stack"
                    except IndexError:
                        pass
                    except:
                        return "FAIL: peek() should raise IndexError on empty stack"
                    
                    # Test with different data types
                    string_stack = Stack()
                    string_stack.push("a")
                    string_stack.push("b")
                    if string_stack.pop() != "b":
                        return "FAIL: Should handle string values"
                    
                    # Test is_empty
                    temp_stack = Stack()
                    if not temp_stack.is_empty():
                        return "FAIL: New stack should be empty"
                    
                    temp_stack.push(1)
                    if temp_stack.is_empty():
                        return "FAIL: Stack with items should not be empty"
                    
                    temp_stack.pop()
                    if not temp_stack.is_empty():
                        return "FAIL: Stack should be empty after pop"
                    
                    return "PASS: All stack operations working correctly"
                except Exception as e:
                    return f"FAIL: Error during testing - {str(e)}"
            
            print(test_stack_implementation())

          `;

      }else if (problemId === '13') {  // Queue Implementation
            testCode += `
              def test_queue_implementation():
                  try:
                      # Verify Queue class exists
                      if 'Queue' not in globals():
                          return "FAIL: Queue class not defined"
                      
                      # Test initialization
                      queue = Queue()
                      if not queue.is_empty():
                          return "FAIL: New queue should be empty"
                      
                      if queue.size() != 0:
                          return "FAIL: New queue size should be 0"
                      
                      # Test enqueue and peek
                      queue.enqueue(1)
                      if queue.peek() != 1:
                          return "FAIL: peek() should return 1 after enqueuing 1"
                      
                      if queue.size() != 1:
                          return "FAIL: size() should be 1 after one enqueue"
                          
                      # Test multiple enqueues
                      queue.enqueue(2)
                      queue.enqueue(3)
                      if queue.peek() != 1:
                          return "FAIL: peek() should return first item (1) after enqueuing 2 and 3"
                      
                      if queue.size() != 3:
                          return "FAIL: size() should be 3 after three enqueues"
                      
                      # Test dequeue (FIFO order)
                      if queue.dequeue() != 1:
                          return "FAIL: First dequeue() should return 1 (FIFO)"
                      
                      if queue.dequeue() != 2:
                          return "FAIL: Second dequeue() should return 2 (FIFO)"
                      
                      if queue.size() != 1:
                          return "FAIL: size() should be 1 after two dequeues"
                      
                      # Test empty queue errors
                      empty_queue = Queue()
                      try:
                          empty_queue.dequeue()
                          return "FAIL: dequeue() should raise error on empty queue"
                      except IndexError:
                          pass
                      except:
                          return "FAIL: dequeue() should raise IndexError on empty queue"
                      
                      try:
                          empty_queue.peek()
                          return "FAIL: peek() should raise error on empty queue"
                      except IndexError:
                          pass
                      except:
                          return "FAIL: peek() should raise IndexError on empty queue"
                      
                      # Test with different data types
                      string_queue = Queue()
                      string_queue.enqueue("a")
                      string_queue.enqueue("b")
                      if string_queue.dequeue() != "a":
                          return "FAIL: Should handle string values (FIFO order)"
                      
                      # Test is_empty
                      temp_queue = Queue()
                      if not temp_queue.is_empty():
                          return "FAIL: New queue should be empty"
                      
                      temp_queue.enqueue(1)
                      if temp_queue.is_empty():
                          return "FAIL: Queue with items should not be empty"
                      
                      temp_queue.dequeue()
                      if not temp_queue.is_empty():
                          return "FAIL: Queue should be empty after dequeue"
                      
                      # Test exact FIFO behavior
                      fifo_test = Queue()
                      for i in range(1, 6):
                          fifo_test.enqueue(i)
                      for i in range(1, 6):
                          if fifo_test.dequeue() != i:
                              return f"FAIL: Expected FIFO order, got wrong item at position {i}"
                      
                      return "PASS: All queue operations working correctly (FIFO order maintained)"
                  except Exception as e:
                      return f"FAIL: Error during testing - {str(e)}"
              
              print(test_queue_implementation())
            `;

      }else if (problemId === '15') {  // LinkedList Implementation 
              testCode += `
                def test_linked_list_implementation():
                    try:
                        # Verify classes exist
                        if 'Node' not in globals() or 'LinkedList' not in globals():
                            return "FAIL: Node or LinkedList class not defined"
                        
                        # Test empty list initialization
                        ll = LinkedList()
                        if ll.head is not None or ll.tail is not None:
                            return "FAIL: New linked list should have null head and tail"
                        
                        if ll.to_list() != []:
                            return "FAIL: Empty list should convert to empty Python list"
                        
                        # Test append
                        ll.append(1)
                        if ll.to_list() != [1]:
                            return "FAIL: Append first item failed"
                        if ll.head.value != 1 or ll.tail.value != 1:
                            return "FAIL: Head and tail should point to first node"
                        
                        ll.append(2)
                        if ll.to_list() != [1, 2]:
                            return "FAIL: Append second item failed"
                        if ll.tail.value != 2:
                            return "FAIL: Tail should point to last node"
                        
                        # Test prepend
                        ll.prepend(0)
                        if ll.to_list() != [0, 1, 2]:
                            return "FAIL: Prepend item failed"
                        if ll.head.value != 0:
                            return "FAIL: Head should point to new first node"
                        
                        # Test search
                        if not ll.search(1):
                            return "FAIL: Search failed to find existing item"
                        if ll.search(5):
                            return "FAIL: Search incorrectly found non-existent item"
                        
                        # Test delete
                        ll.delete(1)
                        if ll.to_list() != [0, 2]:
                            return "FAIL: Delete middle item failed"
                        
                        ll.delete(0)
                        if ll.to_list() != [2]:
                            return "FAIL: Delete first item failed"
                        if ll.head.value != 2 or ll.tail.value != 2:
                            return "FAIL: Head and tail should point to remaining node"
                        
                        ll.delete(2)
                        if ll.to_list() != []:
                            return "FAIL: Delete last item failed"
                        if ll.head is not None or ll.tail is not None:
                            return "FAIL: Empty list should have null head and tail"
                        
                        # Test edge cases
                        ll.append(1)
                        ll.append(1)
                        ll.delete(1)
                        if ll.to_list() != [1]:
                            return "FAIL: Should only delete first occurrence"
                        
                        ll.delete(99)  # Should not error
                        if ll.to_list() != [1]:
                            return "FAIL: Deleting non-existent item should not modify list"
                        
                        # Test with strings
                        str_list = LinkedList()
                        str_list.append("a")
                        str_list.append("b")
                        str_list.prepend("c")
                        if str_list.to_list() != ["c", "a", "b"]:
                            return "FAIL: String handling failed"
                        
                        return "PASS: All linked list operations working correctly"
                    except Exception as e:
                        return f"FAIL: Error during testing - {str(e)}"
                
                print(test_linked_list_implementation())
              `;

      }else if (problemId === '16') {  // Decorators
                testCode += `
                  import functools
                  import time
                  import random
                  from io import StringIO
                  import sys
              
                  def test_decorators():
                      try:
                          # Test timer decorator
                          @timer
                          def timed_function():
                              time.sleep(0.1)
                              return "Timed result"
              
                          # Capture timer output
                          old_stdout = sys.stdout
                          sys.stdout = StringIO()
                          result = timed_function()
                          output = sys.stdout.getvalue()
                          sys.stdout = old_stdout
              
                          if not output.startswith("Execution of timed_function took"):
                              return "FAIL: timer decorator missing execution time output"
                          if result != "Timed result":
                              return "FAIL: timer decorator modified return value"
              
                          # Test debug decorator
                          @debug
                          def debug_function(a, b, c=3):
                              return a + b + c
              
                          sys.stdout = StringIO()
                          result = debug_function(1, 2, c=4)
                          output = sys.stdout.getvalue()
                          sys.stdout = old_stdout
              
                          expected_debug = [
                              "Calling debug_function(1, 2, c=4)",
                              "Returning 7"
                          ]
                          for line in expected_debug:
                              if line not in output:
                                  return f"FAIL: debug decorator missing expected output: {line}"
                          if result != 7:
                              return "FAIL: debug decorator modified return value"
              
                          # Test retry decorator
                          @retry(3)
                          def failing_function(attempts_to_succeed=2):
                              failing_function.call_count += 1
                              if failing_function.call_count < attempts_to_succeed:
                                  raise ValueError("Not ready yet")
                              return "Success"
                          
                          failing_function.call_count = 0
              
                          sys.stdout = StringIO()
                          result = failing_function(2)
                          output = sys.stdout.getvalue()
                          sys.stdout = old_stdout
              
                          if "Attempt 1/3 failed: Not ready yet" not in output:
                              return "FAIL: retry decorator missing failure message"
                          if result != "Success":
                              return "FAIL: retry decorator didn't return successful result"
              
                          # Test retry gives up after max attempts
                          @retry(2)
                          def always_fails():
                              always_fails.call_count += 1
                              raise RuntimeError("Always fails")
                          
                          always_fails.call_count = 0
              
                          sys.stdout = StringIO()
                          try:
                              always_fails()
                              return "FAIL: retry decorator should have raised exception"
                          except RuntimeError as e:
                              if str(e) != "Always fails":
                                  return f"FAIL: retry decorator raised wrong exception: {e}"
                          output = sys.stdout.getvalue()
                          sys.stdout = old_stdout
              
                          if always_fails.call_count != 2:
                              return f"FAIL: retry decorator didn't make expected attempts (expected 2, got {always_fails.call_count})"
                          if "Attempt 2/2 failed: Always fails" not in output:
                              return "FAIL: retry decorator missing final failure message"
              
                          return "PASS: All decorators working correctly"
                      except Exception as e:
                          return f"FAIL: Error during decorator testing - {str(e)}"
              
                  # Verify decorator functions exist
                  if 'timer' not in globals():
                      print("FAIL: timer decorator not defined")
                  elif 'debug' not in globals():
                      print("FAIL: debug decorator not defined")
                  elif 'retry' not in globals():
                      print("FAIL: retry decorator not defined")
                  else:
                      print(test_decorators())
                `;

      } else {
        // Default case for problems without specific tests
        testCode += `
    # Default case for problems without specific tests
    print("INFO: No specific test cases defined for this problem. Running basic validation...")

    # Check if the required operation for this problem is present and valid
    if '${problemId}' == '14':  # Binary Search Tree, if this is binary search problem
        # Define functions we expect to see
        expected_functions = ['insert', 'search', 'inorder_traversal', 'min_value', 'max_value']

        # Check if BinarySearchTree class exists
        if 'BinarySearchTree' not in globals():
            print("FAIL: Could not find a 'BinarySearchTree' class in your code")
        else:
            # Create a new instance for testing
            try:
                # Test BST implementation
                bst = BinarySearchTree()
                bst.insert(5)
                bst.insert(3)
                bst.insert(7)

                # Check if search works
                if not hasattr(bst, 'search') or not bst.search(5):
                    print("FAIL: search method not working correctly")
                elif not hasattr(bst, 'inorder_traversal'):
                    print("FAIL: inorder_traversal method not implemented")
                else:
                    # Basic testing passed
                    print("PASS: Basic BST operations appear to be working")
            except Exception as e:
                print(f"FAIL: Error testing BST implementation: {str(e)}")
    else:
        # For other problems, check for solution function
        try:
            # First check if a solution() function exists and try to run it
            if 'solution' in globals():
                try:
                    solution()
                    # The existence of solution doesn't guarantee correctness
                    # This is why we're only showing a caution, not marking as passing
                    print("CAUTION: The solution function runs without errors, but its correctness hasn't been verified.")
                    print("FAIL: This problem requires specific test cases to verify correctness.")
                except Exception as e:
                    print(f"FAIL: Your solution() function raised an error: {str(e)}")
            else:
                # Try to find and execute any defined functions
                user_functions = [name for name, obj in globals().items()
                                if callable(obj) and not name.startswith('__') and name != 'test_output'
                                and name not in ('StringIO', 'exec', 'print', 'str')]

                if user_functions:
                    print(f"Found user-defined functions: {', '.join(user_functions)}")
                    print("FAIL: Cannot automatically verify the correctness of these functions. This problem requires specific test cases.")
                else:
                    print("FAIL: No user-defined functions found. Make sure you've implemented the required functionality.")
        except Exception as e:
            print(f"FAIL: Your code raised an error: {str(e)}")
`;
      }

      // Common test wrap-up
      testCode += `
except Exception as e:
    print(f"FAIL: Runtime error during tests: {str(e)}")

# Get the test output
test_output = sys.stdout.getvalue()
sys.stdout = original_stdout

print(test_output)
`;

      const result = await runPythonInWorker(testCode, shouldReset);
      setOutput(result || 'Tests completed but returned no output.');

      // Process test results with more robust validation
      let passed = false;

      // Check if the result contains a PASS message AND doesn't contain any FAIL messages
      if (result.includes('PASS:') && !result.includes('FAIL:')) {
        // Only mark as completed if there's a clear PASS without any FAIL
        markProblemCompleted(problemId);
        isCompletedRef.current = true;

        passed = true;
        setTestResults({
          passed: true,
          message: 'Success! All tests passed. Great work! 🎉'
        });
      } else if (result.includes('FAIL:')) {
        // Extract the failure message to show the specific error
        const failureMatch = result.match(/FAIL: .+/);
        setTestResults({
          passed: false,
          message: failureMatch ? failureMatch[0] : 'Tests failed. Please review your code and try again.'
        });
      } else {
        setTestResults({
          passed: false,
          message: 'Your solution could not be properly evaluated. Please review your code and make sure it implements all required functionality.'
        });
      }

      // Call the onSubmitResult callback if provided
      if (onSubmitResult) {
        onSubmitResult(result, passed);
      }
    } catch (error) {
      console.error('Test execution error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setOutput(`Error running tests: ${errorMessage}`);
      setTestResults({ passed: false, message: 'Error occurred during testing.' });

      // Call onSubmitResult with error information
      if (onSubmitResult) {
        onSubmitResult(`Error running tests: ${errorMessage}`, false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Python Editor</h3>
        <div className="flex gap-2">
          <Button
            onClick={resetCode}
            variant="outline"
            className="border-gray-300 dark:border-zinc-700"
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={runCode}
            disabled={isRunning || !pyodideReady}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Run Code"
          >
            <Play className="h-4 w-4 mr-1" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            onClick={submitCode}
            disabled={isSubmitting || !pyodideReady}
            className="bg-green-600 hover:bg-green-700 text-white"
            title="Submit Solution"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>

      <div className="flex-1 border border-gray-300 dark:border-zinc-700 rounded-md overflow-hidden mb-4">
        <CodeMirror
          value={code}
          height="100%"
          theme={darkMode ? oneDark : 'light'}
          extensions={[python()]}
          onChange={handleCodeChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {testResults && (
        <div className={`p-3 mb-4 rounded-md ${
          testResults.passed
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
        }`}>
          {testResults.message}
        </div>
      )}

      <div className="mt-2">
        <h3 className="text-lg font-medium mb-2">Output</h3>
        <div
          className={`h-32 p-3 font-mono text-sm border border-gray-300 dark:border-zinc-700 rounded-md overflow-auto whitespace-pre-wrap ${
            darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-50 text-gray-900'
          }`}
        >
          {output}
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Note: For best results, use simple Python code that doesn't involve file operations or external libraries.
        </div>
      </div>
    </div>
  );
}
