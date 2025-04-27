import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const problemsFilePath = join(__dirname, 'src', 'data', 'problems.ts');

try {
  console.log('Reading problems.ts file...');
  const fileContent = readFileSync(problemsFilePath, 'utf-8');

  // Find the incomplete getProblemsByCategory function
  const startMarker = '// Function to get all problems organized by category';
  const endMarker = '// Sorting Algorithms';

  const startIndex = fileContent.indexOf(startMarker);
  const endIndex = fileContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find the appropriate markers in the file.');
    process.exit(1);
  }

  // Fixed function content
  const fixedFunction = `// Function to get all problems organized by category
export function getProblemsByCategory() {
  const categories: Record<string, Problem[]> = {};

  for (const problem of problems) {
    if (!categories[problem.category]) {
      categories[problem.category] = [];
    }
    categories[problem.category].push(problem);
  }

  // Helper function to convert difficulty level to a numeric value for sorting
  const difficultyValue = (difficulty: string): number => {
    switch (difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      default: return 4; // Any other difficulty level
    }
  };

  // Sort problems by difficulty within each category
  Object.values(categories).forEach(categoryProblems => {
    categoryProblems.sort((a, b) => difficultyValue(a.difficulty) - difficultyValue(b.difficulty));
  });

  return Object.entries(categories).map(([name, problems]) => ({
    name,
    emoji: problems[0].categoryEmoji, // Get emoji from the first problem in category
    problems
  }));
}`;

  // Create the fixed content
  const fixedContent =
    fileContent.substring(0, startIndex) +
    fixedFunction +
    "\n\n" +
    fileContent.substring(endIndex);

  // Write the fixed content back to the file
  console.log('Writing fixed content to problems.ts file...');
  writeFileSync(problemsFilePath, fixedContent, 'utf-8');

  console.log('Successfully fixed problems.ts file!');
} catch (error) {
  console.error('Error:', error);
}
