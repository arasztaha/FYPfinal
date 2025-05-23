// Update script
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const problemsFilePath = join(__dirname, 'src', 'data', 'problems.ts');
const fileContent = readFileSync(problemsFilePath, 'utf-8');

// Define the new function
const newFunction = `// Function to get all problems organized by category
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

// Replace the old function with the new one
const oldFunctionPattern = /\/\/ Function to get all problems organized by category[\s\S]*?export function getProblemsByCategory\(\)[\s\S]*?\}\)/;
const updatedContent = fileContent.replace(oldFunctionPattern, newFunction);

// Write the updated content back to the file
writeFileSync(problemsFilePath, updatedContent, 'utf-8');

console.log('Function updated successfully!');
