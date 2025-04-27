import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { problems } from '@/data/problems';
import { useTheme } from '../lib/themeContext';
import { CodeEditor } from '@/components/CodeEditor';
import { useState } from 'react';
import { getAIResponse, generateSystemPrompt, type OpenAIMessage, getCodeFeedback } from '../lib/openaiService';
import { AIAssistant } from '@/components/AIAssistant';
import { CodeFeedback } from '@/components/CodeFeedback';

export function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const { darkMode } = useTheme();
  const [currentCode, setCurrentCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [codeFeedbackLoading, setCodeFeedbackLoading] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{
    passed: boolean;
    message: string;
    aiSuggestions?: string;
  } | null>(null);

  // Get the last assistant response for display
  const lastResponse = conversation.length > 0
    ? conversation.filter(msg => msg.role === 'assistant').pop()?.content || null
    : null;

  // Find the problem with the matching slug
  const problem = problems.find((p) => p.slug === slug);

  if (!problem) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
        <p className="mb-6">The problem you're looking for doesn't exist.</p>
        <Link
          to="/practice"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practice
        </Link>
      </div>
    );
  }

  // Initial code template for this problem
  const firstLine = problem.description.split('\n')[0];
  let initialCode = `# ${problem.title}\n# ${firstLine}\n\n`;

  // Add problem-specific starter code templates
  if (problem.id === '1') { // Hello World
    initialCode += `# Write a function called hello_world that returns the string "Hello, World!"\ndef hello_world():\n    # Your code here\n    pass\n\n# Test your solution (uncomment to test)\n# print(hello_world())\n`;
  } else if (problem.id === '2') { // Reverse a String
    initialCode += `# Write a function called reverse_string that reverses a string\ndef reverse_string(s):\n    # Your code here\n    pass\n\n# Test your solution\n# print(reverse_string("hello"))\n`;
  } else if (problem.id === '3') { // Sum of a List
    initialCode += `# Write a function called sum_list that calculates the sum of all numbers in a list\ndef sum_list(numbers):\n    # Your code here\n    pass\n\n# Test your solution\n# print(sum_list([1, 2, 3, 4, 5]))\n`;
  } else if (problem.id === '4') { // Palindrome Checker
    initialCode += `# Write a function called is_palindrome that checks if a string is a palindrome\ndef is_palindrome(s):\n    # Your code here\n    pass\n\n# Test your solution\n# print(is_palindrome("racecar"))\n# print(is_palindrome("hello"))\n`;
  } else {
    // Default template for other problems
    initialCode += `def solution():\n    # Write your code here\n    pass\n\n# Test your solution\nsolution()\n`;
  }

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
    // Clear feedback when code changes
    setCodeFeedback(null);
  };

  // Function to handle AI question submission using OpenAI API
  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;

    // Add user question to conversation with a unique ID
    const userId = `user-${Date.now()}`;
    setConversation(prev => [...prev, { id: userId, role: 'user', content: question }]);
    setIsLoading(true);

    try {
      // Prepare messages for OpenAI
      const messages: OpenAIMessage[] = [
        // System message with problem context
        {
          role: 'system',
          content: generateSystemPrompt({
            id: problem.id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            examples: problem.examples,
            constraints: problem.constraints,
            hints: problem.hints,
            solution: problem.solution
          })
        }
      ];

      // Add previous conversation history if it exists
      for (const message of conversation) {
        messages.push({
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content
        });
      }

      // Add the current user question
      messages.push({
        role: 'user',
        content: currentCode
          ? `My code so far:\n\`\`\`python\n${currentCode}\n\`\`\`\n\nMy question: ${question}`
          : question
      });

      // Get response from OpenAI
      const response = await getAIResponse(messages);

      // Add AI response to conversation with a unique ID
      const assistantId = `assistant-${Date.now()}`;
      setConversation(prev => [...prev, { id: assistantId, role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI assistance:', error);

      // Add error message to conversation with a unique ID
      const errorId = `error-${Date.now()}`;
      setConversation(prev => [
        ...prev,
        {
          id: errorId,
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle code submission feedback
  const handleCodeSubmissionFeedback = async (testResults: string, passed: boolean) => {
    if (!currentCode) return;

    setCodeFeedbackLoading(true);
    setCodeFeedback(null);

    try {
      // Get AI feedback on the code submission
      const feedback = await getCodeFeedback(
        {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          examples: problem.examples,
          constraints: problem.constraints,
          hints: problem.hints,
          solution: problem.solution
        },
        currentCode,
        testResults,
        passed
      );

      // Update feedback state
      setCodeFeedback({
        passed,
        message: passed ? 'All tests passed successfully!' : 'Your solution did not pass all tests.',
        aiSuggestions: feedback
      });
    } catch (error) {
      console.error('Error getting code feedback:', error);
      setCodeFeedback({
        passed,
        message: passed ? 'All tests passed successfully!' : 'Your solution did not pass all tests.',
        aiSuggestions: 'Sorry, I encountered an error while analyzing your code.'
      });
    } finally {
      setCodeFeedbackLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          to="/practice"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practice
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Problem description panel with AI Assistant at the bottom */}
        <div className="lg:w-1/2 lg:max-w-xl">
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <div className="flex items-center mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    problem.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{problem.description}</p>

                  {problem.examples && problem.examples.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Examples:</h3>
                      {problem.examples.map((example, i) => (
                        <div key={`example-${example.input}-${i}`} className={`p-3 mb-3 rounded-md ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                          <p className="font-mono text-sm mb-1"><strong>Input:</strong> {example.input}</p>
                          <p className="font-mono text-sm mb-1"><strong>Output:</strong> {example.output}</p>
                          {example.explanation && (
                            <p className="text-sm mt-2"><strong>Explanation:</strong> {example.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Constraints:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {problem.constraints.map((constraint, i) => (
                          <li key={`constraint-${constraint.substring(0, 10)}-${i}`}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hints">
                <div className="prose dark:prose-invert max-w-none mt-4">
                  {problem.hints && problem.hints.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Hints:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        {problem.hints.map((hint, i) => (
                          <li key={`hint-${hint.substring(0, 10)}-${i}`}>{hint}</li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p>No hints available for this problem.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="solution">
                <div className="prose dark:prose-invert max-w-none mt-4">
                  {problem.solution ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Solution:</h3>
                      <p className="mb-4">{problem.solution.explanation}</p>
                      <div className={`p-4 rounded-md font-mono text-sm whitespace-pre overflow-auto ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                        {problem.solution.code}
                      </div>
                    </div>
                  ) : (
                    <p>Solution not available yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* AI Learning Assistant integrated at the bottom of the problem panel */}
            <AIAssistant
              problemId={problem.id}
              problemTitle={problem.title}
              problemDifficulty={problem.difficulty}
              currentCode={currentCode}
              onAskQuestion={handleAskAI}
              lastResponse={lastResponse}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Code editor panel with code feedback underneath */}
        <div className="lg:w-1/2 flex-1 flex flex-col gap-6">
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200'}`} style={{ minHeight: "600px" }}>
            <CodeEditor
              initialCode={initialCode}
              problemId={problem.id}
              onCodeChange={handleCodeChange}
              onSubmitResult={handleCodeSubmissionFeedback}
            />
          </div>

          {/* Code Feedback Section - under the code editor */}
          {(codeFeedbackLoading || codeFeedback) && (
            <div>
              <CodeFeedback
                isLoading={codeFeedbackLoading}
                feedback={codeFeedback}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
