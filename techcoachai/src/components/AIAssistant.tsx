import React from 'react';
import { Button } from './ui/button';
import { Bot, HelpCircle, Lightbulb, Code, Workflow, Loader2 } from 'lucide-react';
import { useTheme } from '../lib/themeContext';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  currentCode?: string;
  onAskQuestion: (question: string) => void;
  lastResponse?: string | null;
  isLoading: boolean;
}

export function AIAssistant({
  problemTitle,
  problemDifficulty,
  onAskQuestion,
  lastResponse,
  isLoading
}: AIAssistantProps) {
  const { darkMode } = useTheme();

  // Predefined assistance questions
  const assistanceOptions = [
    {
      id: "explain",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
      label: "Explain this problem",
      question: "Can you explain this problem in simple terms?"
    },
    {
      id: "hint",
      icon: <Lightbulb className="h-4 w-4 mr-2" />,
      label: "Give me a hint",
      question: "I need a hint to solve this problem without giving away the solution."
    },
    {
      id: "approach",
      icon: <Code className="h-4 w-4 mr-2" />,
      label: "Help with my approach",
      question: "Is my current approach on the right track? What should I consider?"
    },
    {
      id: "plan",
      icon: <Workflow className="h-4 w-4 mr-2" />,
      label: "Create a structured plan",
      question: "Can you help me create a step-by-step plan to solve this problem?"
    }
  ];

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-6">
      <div className="flex items-center mb-4">
        <Bot className="h-5 w-5 mr-2 text-blue-500" />
        <h2 className="text-lg font-bold">Learning Assistant</h2>
        {isLoading && (
          <div className="ml-3 h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Need help with <strong>{problemTitle}</strong>? ({problemDifficulty})
        Select an option below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {assistanceOptions.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className={`justify-start text-left ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => onAskQuestion(option.question)}
            disabled={isLoading}
          >
            {option.icon}
            {option.label}
          </Button>
        ))}
      </div>

      {/* Response Area */}
      {lastResponse && (
        <div className={`mt-4 p-4 rounded-md ${
          darkMode ? 'bg-zinc-800/80 border border-zinc-700' : 'bg-blue-50/80 border border-blue-100'
        }`}>
          <div className="flex items-start space-x-3">
            <Bot className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
            <div className="prose prose-sm dark:prose-invert max-w-none w-full">
              <ReactMarkdown>
                {lastResponse}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {isLoading && !lastResponse && (
        <div className={`mt-4 p-4 rounded-md flex items-center space-x-3 ${
          darkMode ? 'bg-zinc-800/50 border border-zinc-700' : 'bg-blue-50/50 border border-blue-100'
        }`}>
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-sm">Analyzing your request...</p>
        </div>
      )}
    </div>
  );
}
