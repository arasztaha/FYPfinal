import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../lib/themeContext';
import ReactMarkdown from 'react-markdown';

interface CodeFeedbackProps {
  isLoading: boolean;
  feedback: {
    passed: boolean;
    message: string;
    aiSuggestions?: string;
  } | null;
}

export function CodeFeedback({ isLoading, feedback }: CodeFeedbackProps) {
  const { darkMode } = useTheme();

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
        darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <p>Analyzing your code submission...</p>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${
      feedback.passed
        ? darkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'
        : darkMode ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start">
        {feedback.passed ? (
          <CheckCircle className="h-5 w-5 mt-0.5 mr-3 text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
        )}

        <div className="space-y-2 w-full">
          <h3 className={`font-medium ${
            feedback.passed
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {feedback.passed ? 'Success!' : 'Not quite right'}
          </h3>

          <div className="text-sm">
            <ReactMarkdown>{feedback.message}</ReactMarkdown>
          </div>

          {feedback.aiSuggestions && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
              <h4 className="text-sm font-medium mb-2">
                {feedback.passed ? 'Suggestions for improvement:' : 'Guidance for fixing:'}
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{feedback.aiSuggestions}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
