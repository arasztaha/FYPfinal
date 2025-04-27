// Script to add sorting problems
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const problemsFilePath = join(__dirname, 'src', 'data', 'problems.ts');
const fileContent = readFileSync(problemsFilePath, 'utf-8');

// Find the position where to insert the new problems (right before the closing bracket)
const insertPosition = fileContent.lastIndexOf(']');

// New sorting problems
const newProblems = `,

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
  }`;

// Insert the new problems at the position
const updatedContent = fileContent.slice(0, insertPosition) + newProblems + fileContent.slice(insertPosition);

// Write the updated content back to the file
writeFileSync(problemsFilePath, updatedContent, 'utf-8');

console.log('Sorting problems added successfully!');
