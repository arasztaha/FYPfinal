import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const problemsFilePath = join(__dirname, 'src', 'data', 'problems.ts');
const content = readFileSync(problemsFilePath, 'utf-8');

// Replace the problematic part with the correct version
const fixedContent = content.replace(
  /}\)\);(\r?\n)}/g,
  '});\n}'
);

writeFileSync(problemsFilePath, fixedContent, 'utf-8');
console.log('File fixed successfully!');
