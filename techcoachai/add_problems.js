const fs = require('fs');

const filePath = 'src/data/problems.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the position of the last closing bracket
const lastBracketIndex = fileContent.lastIndexOf(']');

// Create the new problems
const newProblems = `
  // New easy task - Error Handling
  {
    id: '25',
    title: 'Safe Division',
    slug: 'safe-division',
    difficulty: 'Easy',
    category: 'Error Handling',
    categoryEmoji: '🛡️',
    description: 'Write a function \`safe_divide(a, b, default=None)\` that safely divides two numbers.\\n\\nIf the divisor (b) is zero, instead of raising a ZeroDivisionError, the function should return the default value. If no default value is provided, return None for division by zero cases.',
    examples: [
      {
        input: 'safe_divide(10, 2)',
        output: '5.0',
        explanation: 'Normal division: 10 ÷ 2 = 5.0'
      },
      {
        input: 'safe_divide(10, 0)',
        output: 'None',
        explanation: 'Division by zero returns None when no default is specified'
      },
      {
        input: 'safe_divide(10, 0, default="Error")',
        output: '"Error"',
        explanation: 'Division by zero returns the specified default value'
      }
    ],
    constraints: [
      'Return the result as a float for successful divisions',
      'Return the default value (None if not provided) for division by zero',
      'Handle cases where inputs are not numbers by returning the default value'
    ],
    hints: [
      'Use try/except to catch ZeroDivisionError',
      'You might also want to catch TypeError for cases where inputs are not numbers',
      'Return the division result as a float using float(a) / float(b)'
    ],
    solution: {
      explanation: 'We implement a function that safely divides two numbers by handling the ZeroDivisionError. The function returns the result as a float for successful divisions, and the default value (None if not provided) for division by zero or invalid inputs.',
      code: \`def safe_divide(a, b, default=None):
    try:
        return float(a) / float(b)
    except ZeroDivisionError:
        return default
    except (TypeError, ValueError):
        # Handle cases where inputs can't be converted to float
        return default

# Test cases
print(safe_divide(10, 2))      # 5.0
print(safe_divide(10, 0))      # None
print(safe_divide(10, 0, "Error"))  # Error
print(safe_divide("10", "2"))  # 5.0
print(safe_divide("10", "abc", "Invalid input"))  # Invalid input\`
    }
  },

  // New easy task - Password Validation
  {
    id: '26',
    title: 'Password Validator',
    slug: 'password-validator',
    difficulty: 'Easy',
    category: 'String Validation',
    categoryEmoji: '🔒',
    description: 'Write a function \`validate_password(password)\` that checks if a password meets the following criteria:\\n\\n1. At least 8 characters long\\n2. Contains at least one uppercase letter\\n3. Contains at least one lowercase letter\\n4. Contains at least one digit\\n5. Contains at least one special character (@, #, $, %, ^, &, +, =, !)\\n\\nThe function should return True if the password meets all criteria, False otherwise.',
    examples: [
      {
        input: 'validate_password("Passw0rd!")',
        output: 'True',
        explanation: 'Contains uppercase, lowercase, digit, special character, and is 9 characters long'
      },
      {
        input: 'validate_password("abc123")',
        output: 'False',
        explanation: 'Too short and missing uppercase and special character'
      },
      {
        input: 'validate_password("PASSWORD123!")',
        output: 'False',
        explanation: 'Missing lowercase letter'
      }
    ],
    constraints: [
      'Input will be a string',
      'Special characters are limited to: @, #, $, %, ^, &, +, =, !',
      'Return True only if all criteria are met'
    ],
    hints: [
      'Use string methods like isupper(), islower(), isdigit() to check character types',
      'Regular expressions can be used to simplify validation',
      'Check each criteria separately and combine the results'
    ],
    solution: {
      explanation: 'We implement a function that validates passwords against multiple criteria. We check for length, and then use loops or regular expressions to verify the presence of required character types.',
      code: \`def validate_password(password):
    # Check length
    if len(password) < 8:
        return False
    
    # Check for at least one uppercase letter
    has_upper = False
    # Check for at least one lowercase letter
    has_lower = False
    # Check for at least one digit
    has_digit = False
    # Check for at least one special character
    has_special = False
    
    special_chars = "@#$%^&+=!"
    
    for char in password:
        if char.isupper():
            has_upper = True
        elif char.islower():
            has_lower = True
        elif char.isdigit():
            has_digit = True
        elif char in special_chars:
            has_special = True
    
    # Return True only if all criteria are met
    return has_upper and has_lower and has_digit and has_special

# Alternative solution using regular expressions
import re

def validate_password_regex(password):
    # Check length
    if len(password) < 8:
        return False
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False
    
    # Check for at least one digit
    if not re.search(r'[0-9]', password):
        return False
    
    # Check for at least one special character
    if not re.search(r'[@#$%^&+=!]', password):
        return False
    
    return True

# Test cases
print(validate_password("Passw0rd!"))  # True
print(validate_password("abc123"))  # False
print(validate_password("PASSWORD123!"))  # False
print(validate_password("password123!"))  # False
print(validate_password("Password123"))  # False\`
    }
  },

  // New easy task - File Handling
  {
    id: '27',
    title: 'File Word Counter',
    slug: 'file-word-counter',
    difficulty: 'Easy',
    category: 'File Handling',
    categoryEmoji: '📁',
    description: 'Write a function \`count_words_in_file(filename)\` that reads a text file and returns the total number of words in it.\\n\\nAssume that words are separated by whitespace (spaces, tabs, newlines).\\n\\nIf the file doesn\\'t exist, the function should handle the error and return 0.',
    examples: [
      {
        input: 'count_words_in_file("sample.txt") # where sample.txt contains "Hello world. This is a test."',
        output: '6',
        explanation: 'The file contains 6 words: "Hello", "world.", "This", "is", "a", "test."'
      },
      {
        input: 'count_words_in_file("empty.txt") # where empty.txt is empty',
        output: '0',
        explanation: 'The file doesn\\'t contain any words'
      },
      {
        input: 'count_words_in_file("nonexistent.txt") # file does not exist',
        output: '0',
        explanation: 'The function returns 0 for a non-existent file'
      }
    ],
    constraints: [
      'Words are separated by whitespace (spaces, tabs, newlines)',
      'Handle the case where the file doesn\\'t exist',
      'Return 0 for empty files or when errors occur'
    ],
    hints: [
      'Use try/except to handle file opening errors',
      'Python\\'s split() method with no arguments splits by whitespace',
      'Remember to close the file after reading it'
    ],
    solution: {
      explanation: 'We implement a function that reads a text file and counts the number of words in it. We use try/except to handle the case where the file doesn\\'t exist. Words are counted by splitting the text by whitespace.',
      code: \`def count_words_in_file(filename):
    try:
        with open(filename, 'r') as file:
            content = file.read()
            words = content.split()
            return len(words)
    except FileNotFoundError:
        return 0
    except Exception as e:
        print(f"An error occurred: {e}")
        return 0

# Test cases - assuming files exist
# print(count_words_in_file("sample.txt"))
# print(count_words_in_file("empty.txt"))
# print(count_words_in_file("nonexistent.txt"))\`
    }
  }`;

// Insert the new problems
const newContent = fileContent.substring(0, lastBracketIndex-1) + ',' + newProblems + fileContent.substring(lastBracketIndex-1);
fs.writeFileSync(filePath, newContent);
console.log('Problems added successfully!');
