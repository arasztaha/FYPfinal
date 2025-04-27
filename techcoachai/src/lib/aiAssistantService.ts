// AI Assistant Service
// This service handles interactions with the OpenAI API for the AI learning assistant

// Define the interface for assistant request and response
export interface AIAssistantRequest {
  problemInfo: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
    hints?: string[];
  };
  userCode?: string;
  userQuestion: string;
}

export interface AIAssistantResponse {
  answer: string;
  isError: boolean;
}

// This would normally call the OpenAI API, but for now we'll use a mock that simulates
// what the AI would return. In a real implementation, you would make the API call here.
export async function getAIAssistance(request: AIAssistantRequest): Promise<AIAssistantResponse> {
  try {
    // Add artificial delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Format the problem information for the AI
    const formattedProblem = `
Problem: ${request.problemInfo.title} (${request.problemInfo.difficulty})
Description: ${request.problemInfo.description}
${request.problemInfo.examples ?
  `Examples: ${JSON.stringify(request.problemInfo.examples, null, 2)}` : ''}
${request.problemInfo.constraints ?
  `Constraints: ${request.problemInfo.constraints.join(', ')}` : ''}
${request.problemInfo.hints ?
  `Available Hints: ${request.problemInfo.hints.join(', ')}` : ''}
    `;

    // In a real implementation, you would send this to the OpenAI API
    console.log('AI Assistant Request:', formattedProblem);
    console.log('User Question:', request.userQuestion);
    console.log('User Code:', request.userCode);

    // For now, return a mock response based on the user's question
    const lowerQuestion = request.userQuestion.toLowerCase();
    let answer = '';

    if (lowerQuestion.includes('hint') || lowerQuestion.includes('help')) {
      // If the user is asking for a hint
      if (request.problemInfo.hints && request.problemInfo.hints.length > 0) {
        answer = `Here's a hint that might help: ${request.problemInfo.hints[0]}`;
      } else {
        answer = `For this ${request.problemInfo.difficulty.toLowerCase()} problem, I'd suggest breaking it down into steps. First, understand what the problem is asking for. Then, think about a simple algorithm to solve it.`;
      }
    } else if (lowerQuestion.includes('explain') || lowerQuestion.includes('understand')) {
      // If the user wants an explanation
      answer = `Let me explain this problem: "${request.problemInfo.title}" is a ${request.problemInfo.difficulty.toLowerCase()} level problem where you need to ${request.problemInfo.description.split('.')[0].toLowerCase()}. Think about the input and output requirements, and consider edge cases.`;
    } else if (lowerQuestion.includes('error') || lowerQuestion.includes('wrong')) {
      // If the user has an error
      if (request.userCode) {
        answer = `I see you're having trouble with your code. Without seeing the specific error, here are some common issues in this type of problem:\n\n1. Check for proper indentation\n2. Make sure you're handling edge cases\n3. Verify the return value matches what the problem expects`;
      } else {
        answer = `It's hard to help with errors without seeing your code. Try sharing your code and explaining what error you're getting.`;
      }
    } else {
      // Generic response
      answer = `I'd be happy to help you with "${request.problemInfo.title}". What specific aspect of this ${request.problemInfo.difficulty.toLowerCase()} problem are you struggling with? I can help with understanding the problem, suggesting approaches, or debugging your code.`;
    }

    return {
      answer,
      isError: false
    };
  } catch (error) {
    console.error('AI Assistant Service Error:', error);
    return {
      answer: 'Sorry, I encountered an error while processing your request. Please try again later.',
      isError: true
    };
  }
}

// In a real implementation, you might also include functions for:
// - Creating a thread with OpenAI
// - Sending user messages to OpenAI
// - Handling streaming responses
// - Managing conversation history
