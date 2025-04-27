import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Problem } from './types';
import { problems as initialProblems } from '../data/problems';
import { useAuth } from './authContext';

// Define the context state type
interface ProblemContextType {
  problems: Problem[];
  completedProblems: string[]; // Array of problem IDs
  markProblemCompleted: (problemId: string) => void;
  isProblemCompleted: (problemId: string) => boolean;
  getCompletedCount: () => number;
  resetCompletedProblems: () => void;
  getCompletedCountByDifficulty: (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Create the context
const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

// Create a provider component
export function ProblemProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);

  // Reset completed problems - use useCallback to memoize this function
  const resetCompletedProblems = useCallback(() => {
    setCompletedProblems([]);
    setProblems(prev =>
      prev.map(problem => ({
        ...problem,
        completed: false
      }))
    );
  }, []);

  // Load completed problems from localStorage on mount or when user changes
  useEffect(() => {
    console.log('User change detected:', user?.id, isAuthenticated);

    if (isAuthenticated && user) {
      // Load user-specific completed problems
      const storageKey = `completedProblems_${user.id}`;
      console.log('Loading from storage key:', storageKey);

      const savedCompletedProblems = localStorage.getItem(storageKey);
      console.log('Raw saved data:', savedCompletedProblems);

      if (savedCompletedProblems) {
        try {
          const parsed = JSON.parse(savedCompletedProblems);
          console.log('Parsed data type:', typeof parsed, Array.isArray(parsed));

          if (Array.isArray(parsed)) {
            console.log(`Found ${parsed.length} completed problems for user ${user.id}:`, parsed);
            setCompletedProblems(parsed);

            // Update problem completion status
            setProblems(prev =>
              prev.map(problem => ({
                ...problem,
                completed: parsed.includes(problem.id)
              }))
            );
          }
        } catch (error) {
          console.error(`Error parsing completed problems for user ${user.id}:`, error);
          resetCompletedProblems();
        }
      } else {
        console.log(`No saved data found for user ${user.id}, resetting`);
        // If no saved data for this user, reset to empty state
        resetCompletedProblems();
      }
    } else {
      console.log('No authenticated user, resetting problem state');
      // If not authenticated, reset to empty state
      resetCompletedProblems();
    }
  }, [user, isAuthenticated, resetCompletedProblems]);

  // Save to localStorage when completedProblems changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Save to user-specific storage
      const storageKey = `completedProblems_${user.id}`;
      console.log(`Saving ${completedProblems.length} problems to ${storageKey}`);
      localStorage.setItem(storageKey, JSON.stringify(completedProblems));
    }
  }, [completedProblems, user, isAuthenticated]);

  // Mark a problem as completed
  const markProblemCompleted = useCallback((problemId: string) => {
    // Only allow marking problems as completed if the user is authenticated
    if (!isAuthenticated || !user) {
      console.warn('Attempted to mark a problem as completed while not logged in');
      return;
    }

    // Check that we're not already tracking this problem as completed
    if (!completedProblems.includes(problemId)) {
      console.log(`Marking problem ${problemId} as completed for user ${user.id}`);

      const newCompletedProblems = [...completedProblems, problemId];
      setCompletedProblems(newCompletedProblems);

      // Update the problems array with the completed status
      setProblems(prev =>
        prev.map(problem =>
          problem.id === problemId
            ? { ...problem, completed: true }
            : problem
        )
      );

      // Save to localStorage immediately to prevent loss on page refresh
      const storageKey = `completedProblems_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newCompletedProblems));
    }
  }, [completedProblems, user, isAuthenticated]);

  // Check if a problem is completed
  const isProblemCompleted = useCallback((problemId: string) => {
    return completedProblems.includes(problemId);
  }, [completedProblems]);

  // Get total number of completed problems
  const getCompletedCount = useCallback(() => {
    return completedProblems.length;
  }, [completedProblems]);

  // Get completed problems count by difficulty
  const getCompletedCountByDifficulty = useCallback((difficulty: 'Easy' | 'Medium' | 'Hard') => {
    const problemsByDifficulty = problems.filter(p => p.difficulty === difficulty);
    const completedCount = problemsByDifficulty.filter(p => completedProblems.includes(p.id)).length;
    const total = problemsByDifficulty.length;
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;

    return {
      completed: completedCount,
      total,
      percentage
    };
  }, [problems, completedProblems]);

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = {
    problems,
    completedProblems,
    markProblemCompleted,
    isProblemCompleted,
    getCompletedCount,
    resetCompletedProblems,
    getCompletedCountByDifficulty
  };

  return (
    <ProblemContext.Provider value={contextValue}>
      {children}
    </ProblemContext.Provider>
  );
}

// Create a hook to use the problem context
export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}
