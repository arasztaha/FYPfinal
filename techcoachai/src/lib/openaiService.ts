// OpenAI API integration service

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o'; // Can be upgraded to gpt-4 if available

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Sends a request to the OpenAI API to get an AI response
 * @param messages Array of message objects with role and content
 * @returns The AI response content
 */
export async function getAIResponse(messages: OpenAIMessage[]): Promise<string> {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not set. Please check your environment variables.');
      return "I'm sorry, the AI service is not properly configured. Please contact support.";
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7, // Controls randomness: lowering results in less random completions
        max_tokens: 1000 // Limit response length
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return `I encountered an issue connecting to my knowledge base. ${error?.error?.message || 'Please try again later.'}`;
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

/**
 * Generates the system prompt for the AI based on the problem
 * @param problemInfo Information about the problem
 * @returns System prompt string
 */
export function generateSystemPrompt(problemInfo: {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
  hints?: string[];
  solution?: { explanation: string; code: string };
}): string {
  // Create a detailed system prompt to guide the AI's responses
  return `You are an AI learning assistant for a coding practice platform called TechCoach.
You are currently helping a student with the following Python programming problem:

PROBLEM TITLE: ${problemInfo.title}
DIFFICULTY: ${problemInfo.difficulty}
DESCRIPTION: ${problemInfo.description}

${problemInfo.examples && problemInfo.examples.length > 0 ?
`EXAMPLES:
${problemInfo.examples.map(ex =>
  `Input: ${ex.input}
   Output: ${ex.output}
   ${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`
).join('\n\n')}` : ''}

${problemInfo.constraints && problemInfo.constraints.length > 0 ?
`CONSTRAINTS:
${problemInfo.constraints.join('\n')}` : ''}

${problemInfo.hints && problemInfo.hints.length > 0 ?
`HINTS:
${problemInfo.hints.join('\n')}` : ''}

${problemInfo.solution ?
`SOLUTION (Only reference this to guide your teaching - never reveal the full solution):
${problemInfo.solution.explanation}
Code: ${problemInfo.solution.code}` : ''}

As an educational assistant, follow these guidelines:
1. Be helpful and encouraging, focusing on teaching rather than just giving answers
2. For direct solution requests, provide guidance, steps, and partial code that helps the student learn
3. Never provide the complete solution outright
4. Offer more detailed help for students who are stuck on specific aspects
5. Use code blocks with Python syntax highlighting when showing code examples (use \`\`\`python ... \`\`\`)
6. When explaining code, break down the logic clearly
7. If a student is frustrated, be patient and try different explanation approaches
8. Correct misconceptions politely
9. Provide clear, concise explanations of programming concepts
10. If the student's code has an error, help identify and explain it

Use Markdown formatting to make your responses more readable:
- Use **bold** for important concepts or terms
- Use *italics* for emphasis
- Use numbered lists for sequential steps
- Use bullet points for related items or options
- Use headings (##) for sections in longer responses
- Use \`inline code\` for short code snippets

Keep your responses focused, educational, and supportive.`;
}

/**
 * Generates a code feedback prompt for the AI based on the submission results
 * @param problemInfo Information about the problem
 * @param userCode The code submitted by the user
 * @param testResults The test results from the code submission
 * @param passed Whether the tests passed
 * @returns System prompt string for code feedback
 */
export function generateCodeFeedbackPrompt(
  problemInfo: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
    hints?: string[];
    solution?: { explanation: string; code: string };
  },
  userCode: string,
  testResults: string,
  passed: boolean
): string {
  // Create a detailed system prompt to guide the AI's code feedback
  return `You are an AI coding tutor providing feedback on a student's Python solution to a coding challenge.

PROBLEM TITLE: ${problemInfo.title}
DIFFICULTY: ${problemInfo.difficulty}
DESCRIPTION: ${problemInfo.description}

${problemInfo.examples && problemInfo.examples.length > 0 ?
`EXAMPLES:
${problemInfo.examples.map(ex =>
  `Input: ${ex.input}
   Output: ${ex.output}
   ${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`
).join('\n\n')}` : ''}

${problemInfo.constraints && problemInfo.constraints.length > 0 ?
`CONSTRAINTS:
${problemInfo.constraints.join('\n')}` : ''}

${problemInfo.solution ?
`REFERENCE SOLUTION (Use this to guide your feedback, but don't reveal it directly):
${problemInfo.solution.code}` : ''}

STUDENT'S CODE:
\`\`\`python
${userCode}
\`\`\`

TEST RESULTS:
${testResults}

THE SUBMISSION ${passed ? 'PASSED' : 'FAILED'} THE TESTS.

Use Markdown formatting in your response to improve readability:
- Use **bold** for emphasis on important points
- Use *italics* for secondary emphasis
- Use numbered lists (1. 2. 3.) for sequential steps or priorities
- Use bullet points (- or *) for related items
- Use \`inline code\` for variables, functions, or short code snippets
- Use code blocks with syntax highlighting for multi-line code: \`\`\`python ... \`\`\`

${passed ?
`As a coding tutor, give the student constructive feedback on their correct solution with:
1. Brief congratulations for solving the problem
2. 2-3 specific improvements they could make to their code (efficiency, readability, best practices, etc.)
3. If relevant, mention a more optimal approach, but don't provide the full solution

Keep your response under 250 words and focus on being educational while acknowledging their success.`
:
`As a coding tutor, help the student fix their failed solution with:
1. Identify the specific issue(s) in their code that caused the test failure
2. Provide clear guidance on how to fix the problem without giving the complete solution
3. If there are conceptual misunderstandings, briefly explain the correct approach

Keep your response under 250 words and be encouraging while providing actionable guidance.`}`;
}

/**
 * Gets AI feedback for a code submission
 * @param problemInfo Information about the problem
 * @param userCode The code submitted by the user
 * @param testResults The test results from the code submission
 * @param passed Whether the tests passed
 * @returns The AI feedback
 */
export async function getCodeFeedback(
  problemInfo: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
    hints?: string[];
    solution?: { explanation: string; code: string };
  },
  userCode: string,
  testResults: string,
  passed: boolean
): Promise<string> {
  try {
    // Generate the appropriate feedback prompt
    const systemPrompt = generateCodeFeedbackPrompt(
      problemInfo,
      userCode,
      testResults,
      passed
    );

    // Create messages array for the API call
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Please provide feedback on my code submission.' }
    ];

    // Get AI response
    return await getAIResponse(messages);
  } catch (error) {
    console.error('Error getting code feedback:', error);
    return 'Sorry, I encountered an error while analyzing your code. Please try again later.';
  }
}
