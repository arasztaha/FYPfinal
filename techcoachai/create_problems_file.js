import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const problemsFilePath = join(__dirname, 'src', 'data', 'problems.ts');

// Create the complete problems.ts file content
const content = `import type { Problem } from '../lib/types';
export const problems: Problem[] = [
  // Introduction
  {
    id: '1',
    title: 'Hello World',
    slug: 'hello-world',
    difficulty: 'Easy',
    category: 'Introduction',
    categoryEmoji: '🔰', // Changed emoji to '🔰'
    description: 'Welcome to coding challenges! Let\\'s start with the classic "Hello World" program.\\\\n\\\\nWrite a function \`hello_world()\` that returns the string "Hello, World!".',
    examples: [
      {
        input: 'hello_world()',
        output: '"Hello, World!"',
        explanation: 'The function returns the string "Hello, World!"'
      }
    ],
    constraints: [
      'Return the exact string "Hello, World!" (case-sensitive)'
    ],
    hints: [
      'In Python, strings can be enclosed in single or double quotes',
      'Use the return keyword to return a value from a function'
    ],
    solution: {
      explanation: 'This is a simple function that returns the string "Hello, World!". It\\'s the traditional first program written when learning a new programming language.',
      code: \`def hello_world():
    return "Hello, World!"

# Test the function
print(hello_world())\`
    }
  },

  // Python Basics
  {
    id: '2',
    title: 'Reverse a String',
    slug: 'reverse-a-string',
    difficulty: 'Easy',
    category: 'Python Basics',
    categoryEmoji: '🐍',
    description: 'Write a function \`reverse_string(s)\` that takes a string as input and returns the reverse of that string.\\\\n\\\\nFor example, if the input is "hello", the output should be "olleh".',
    examples: [
      {
        input: 'reverse_string("hello")',
        output: '"olleh"'
      },
      {
        input: 'reverse_string("Python")',
        output: '"nohtyP"'
      },
      {
        input: 'reverse_string("")',
        output: '""'
      }
    ],
    constraints: [
      'The input string can contain any valid characters',
      'The function should handle empty strings gracefully'
    ],
    hints: [
      'Python has built-in ways to reverse strings',
      'You can use string slicing with a negative step: s[::-1]',
      'Alternatively, you could convert the string to a list, reverse it, and join it back'
    ],
    solution: {
      explanation: 'In Python, the easiest way to reverse a string is to use string slicing with a negative step. The notation s[::-1] creates a slice that starts from the end of the string and moves backwards.',
      code: \`def reverse_string(s):
    return s[::-1]

# Test cases
print(reverse_string("hello"))
print(reverse_string("Python"))
print(reverse_string(""))\`
    }
  },
  {
    id: '3',
    title: 'Sum of a List',
    slug: 'sum-of-a-list',
    difficulty: 'Easy',
    category: 'Python Basics',
    categoryEmoji: '🐍',
    description: 'Write a function \`sum_list(numbers)\` that calculates the sum of all numbers in a list.\\\\n\\\\nFor example, if the input is [1, 2, 3, 4, 5], the output should be 15.',
    examples: [
      {
        input: 'sum_list([1, 2, 3, 4, 5])',
        output: '15',
        explanation: '1 + 2 + 3 + 4 + 5 = 15'
      },
      {
        input: 'sum_list([-1, 0, 1])',
        output: '0',
        explanation: '-1 + 0 + 1 = 0'
      },
      {
        input: 'sum_list([])',
        output: '0',
        explanation: 'The sum of an empty list is 0'
      }
    ],
    constraints: [
      'The list will contain only numbers (integers or floats)',
      'The function should handle empty lists (return 0)'
    ],
    hints: [
      'Python has a built-in sum() function',
      'You could also use a loop to calculate the sum manually'
    ],
    solution: {
      explanation: 'The sum() function in Python takes an iterable (like a list) and returns the sum of all elements. For an empty list, it returns 0.',
      code: \`def sum_list(numbers):
    return sum(numbers)

# Alternative implementation using a loop:
def sum_list_manual(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

# Test cases
print(sum_list([1, 2, 3, 4, 5]))
print(sum_list([-1, 0, 1]))
print(sum_list([]))\`
    }
  },

  // Adding more Python Basics problems here...

  {
    id: '24',
    title: 'Remove Duplicates',
    slug: 'remove-duplicates',
    difficulty: 'Easy',
    category: 'Python Basics',
    categoryEmoji: '🐍',
    description: 'Write a function \`remove_duplicates(items)\` that removes duplicate elements from a list while preserving the original order.\\\\n\\\\nFor example, if the input is [1, 2, 2, 3, 4, 3, 5], the output should be [1, 2, 3, 4, 5].',
    examples: [
      {
        input: 'remove_duplicates([1, 2, 2, 3, 4, 3, 5])',
        output: '[1, 2, 3, 4, 5]',
        explanation: 'Duplicate values 2 and 3 are removed while preserving order'
      },
      {
        input: 'remove_duplicates(["apple", "banana", "apple", "orange", "banana"])',
        output: '["apple", "banana", "orange"]',
        explanation: 'Duplicate strings are removed while preserving order'
      },
      {
        input: 'remove_duplicates([])',
        output: '[]',
        explanation: 'Empty list returns empty list'
      }
    ],
    constraints: [
      'Preserve the original order of elements',
      'The function should work with any list of hashable items',
      'Return an empty list if the input is an empty list'
    ],
    hints: [
      'You can use a set to track items you\\'ve already seen',
      'Sets in Python maintain insertion order since Python 3.7',
      'You can also use dict.fromkeys() to remove duplicates while preserving order'
    ],
    solution: {
      explanation: 'We implement a function that removes duplicate elements from a list while preserving the original order. We use a set to track items we\\'ve already seen and build a new list with only the first occurrence of each item.',
      code: \`def remove_duplicates(items):
    seen = set()
    result = []

    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)

    return result

# Alternative using dict.fromkeys() (Python 3.7+)
def remove_duplicates_alt(items):
    return list(dict.fromkeys(items))

# Test cases
print(remove_duplicates([1, 2, 2, 3, 4, 3, 5]))
print(remove_duplicates(["apple", "banana", "apple", "orange", "banana"]))
print(remove_duplicates([]))\`
    }
  },

  // Sorting Algorithms
  {
    id: '25',
    title: 'Insertion Sort',
    slug: 'insertion-sort',
    difficulty: 'Easy',
    category: 'Sorting',
    categoryEmoji: '🔄',
    description: 'Implement the insertion sort algorithm in Python.\\\\n\\\\nInsertion sort is a simple sorting algorithm that builds the final sorted array one item at a time. It iterates through an array, consuming one input element at each repetition, and growing a sorted output list. At each iteration, insertion sort removes one element from the input data, finds the location it belongs within the sorted list, and inserts it there.\\\\n\\\\nWrite a function \`insertion_sort(arr)\` that sorts a list of numbers in ascending order using the insertion sort algorithm.',
    examples: [
      {
        input: 'insertion_sort([5, 2, 4, 6, 1, 3])',
        output: '[1, 2, 3, 4, 5, 6]',
        explanation: 'The array is sorted in ascending order'
      },
      {
        input: 'insertion_sort([31, 41, 59, 26, 41, 58])',
        output: '[26, 31, 41, 41, 58, 59]',
        explanation: 'The array is sorted in ascending order, maintaining the order of equal elements (stable sort)'
      }
    ],
    constraints: [
      'The input array will only contain integers',
      'The function should modify the array in-place',
      'Your implementation must use the insertion sort algorithm'
    ],
    hints: [
      'Start from the second element and iterate through the array',
      'For each element, compare it with all elements in the sorted portion to its left',
      'Shift elements to the right to make space for the current element in its correct position',
      'Insertion sort has O(n²) time complexity in the worst case but performs well on small or nearly sorted arrays'
    ],
    solution: {
      explanation: 'We implement the insertion sort algorithm which builds the sorted array one element at a time. We iterate through the array and for each element, we find its correct position in the sorted portion of the array by shifting larger elements to the right.',
      code: \`def insertion_sort(arr):
    # Start from the second element (index 1)
    for i in range(1, len(arr)):
        # Element to be inserted into the sorted portion
        key = arr[i]

        # Move elements of arr[0..i-1] that are greater than key
        # to one position ahead of their current position
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1

        # Place the key in its correct position
        arr[j + 1] = key

    return arr

# Test cases
print(insertion_sort([5, 2, 4, 6, 1, 3]))
print(insertion_sort([31, 41, 59, 26, 41, 58]))
print(insertion_sort([]))\`
    }
  },
  {
    id: '26',
    title: 'Merge Sort',
    slug: 'merge-sort',
    difficulty: 'Medium',
    category: 'Sorting',
    categoryEmoji: '🔄',
    description: 'Implement the merge sort algorithm in Python.\\\\n\\\\nMerge sort is an efficient, divide-and-conquer, comparison-based sorting algorithm. It divides the input array into two halves, recursively sorts them, and then merges the sorted halves.\\\\n\\\\nWrite a function \`merge_sort(arr)\` that sorts a list of numbers in ascending order using the merge sort algorithm.',
    examples: [
      {
        input: 'merge_sort([5, 2, 4, 6, 1, 3])',
        output: '[1, 2, 3, 4, 5, 6]',
        explanation: 'The array is sorted in ascending order'
      },
      {
        input: 'merge_sort([38, 27, 43, 3, 9, 82, 10])',
        output: '[3, 9, 10, 27, 38, 43, 82]',
        explanation: 'The array is sorted in ascending order'
      }
    ],
    constraints: [
      'The input array will only contain integers',
      'Your implementation must use the merge sort algorithm',
      'You should implement the merge function separately'
    ],
    hints: [
      'The merge sort algorithm can be divided into 3 steps: 1) Divide the array into two halves, 2) Recursively sort the two halves, 3) Merge the sorted halves',
      'The base case for the recursion is when the array length is 0 or 1',
      'The merge function takes two sorted arrays and combines them into one sorted array',
      'Merge sort has O(n log n) time complexity, making it efficient for large datasets'
    ],
    solution: {
      explanation: 'We implement the merge sort algorithm using the divide-and-conquer strategy. First, we split the array in half and recursively sort each half. Then, we merge the sorted halves using a separate merge function that compares elements from both halves and constructs the sorted result.',
      code: \`def merge_sort(arr):
    # Base case: arrays with 0 or 1 element are already sorted
    if len(arr) <= 1:
        return arr

    # Divide the array into two halves
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]

    # Recursively sort both halves
    left_half = merge_sort(left_half)
    right_half = merge_sort(right_half)

    # Merge the sorted halves
    return merge(left_half, right_half)

def merge(left, right):
    result = []
    i = j = 0

    # Compare elements from both arrays and add the smaller one to the result
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # Add any remaining elements
    result.extend(left[i:])
    result.extend(right[j:])

    return result

# Test cases
print(merge_sort([5, 2, 4, 6, 1, 3]))
print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
print(merge_sort([]))\`
    }
  },
  {
    id: '27',
    title: 'Quick Sort',
    slug: 'quick-sort',
    difficulty: 'Hard',
    category: 'Sorting',
    categoryEmoji: '🔄',
    description: 'Implement the quick sort algorithm in Python.\\\\n\\\\nQuick sort is an efficient, divide-and-conquer, comparison-based sorting algorithm. It selects a \\'pivot\\' element from the array and partitions the other elements into two sub-arrays according to whether they are less than or greater than the pivot. The sub-arrays are then recursively sorted.\\\\n\\\\nWrite a function \`quick_sort(arr)\` that sorts a list of numbers in ascending order using the quick sort algorithm.',
    examples: [
      {
        input: 'quick_sort([5, 2, 4, 6, 1, 3])',
        output: '[1, 2, 3, 4, 5, 6]',
        explanation: 'The array is sorted in ascending order'
      },
      {
        input: 'quick_sort([10, 7, 8, 9, 1, 5])',
        output: '[1, 5, 7, 8, 9, 10]',
        explanation: 'The array is sorted in ascending order'
      }
    ],
    constraints: [
      'The input array will only contain integers',
      'Your implementation must use the quick sort algorithm',
      'You should implement the partition function separately'
    ],
    hints: [
      'The key to quick sort is the partition function, which rearranges the array so elements less than the pivot come before it, and elements greater than the pivot come after it',
      'For the pivot selection, you can choose the first element, last element, median, or a random element',
      'The base case for recursion is when the array has 0 or 1 elements',
      'Quick sort has an average-case time complexity of O(n log n), but can degrade to O(n²) in the worst case'
    ],
    solution: {
      explanation: 'We implement the quick sort algorithm using the Lomuto partition scheme. We select the last element as the pivot, and then partition the array so elements less than the pivot are moved to the left, and elements greater than the pivot are moved to the right. We then recursively sort the partitions.',
      code: \`def quick_sort(arr, low=None, high=None):
    # Initialize low and high for the first call
    if low is None:
        low = 0
    if high is None:
        high = len(arr) - 1

    # Base case: subarray with fewer than 2 elements
    if low < high:
        # Partition the array and get the pivot index
        pivot_index = partition(arr, low, high)

        # Recursively sort the subarrays
        quick_sort(arr, low, pivot_index - 1)  # Sort left of pivot
        quick_sort(arr, pivot_index + 1, high)  # Sort right of pivot

    return arr

def partition(arr, low, high):
    # Choose the rightmost element as the pivot
    pivot = arr[high]

    # Index of the smaller element
    i = low - 1

    # Traverse through all elements
    # compare each element with the pivot
    for j in range(low, high):
        # If current element is smaller than or equal to the pivot
        if arr[j] <= pivot:
            # Increment index of smaller element
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    # Place the pivot in its correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]

    # Return the partition index
    return i + 1

# Test cases
print(quick_sort([5, 2, 4, 6, 1, 3]))
print(quick_sort([10, 7, 8, 9, 1, 5]))
print(quick_sort([]))\`
    }
  }
];

// Function to get all problems organized by category
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

console.log('Creating the problems.ts file...');
writeFileSync(problemsFilePath, content, 'utf-8');
console.log('problems.ts file created successfully!');
