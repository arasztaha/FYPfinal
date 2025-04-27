import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '../lib/themeContext';
import { useAuth } from '../lib/authContext';
import { useProblem } from '../lib/problemContext';
import { Card } from '@/components/ui/card';
import {
  CircleSlash2,
  CheckCircle,
  ChevronRight,
  Lock,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react';
import { useState } from 'react';
import { getProblemsByCategory } from '../data/problems';

// Define the skill path topic structure
interface SkillPathTopic {
  id: string;
  title: string;
  emoji: string;
  description: string;
  completed?: boolean;
  locked?: boolean;
  problems?: number;
  completedProblems?: number;
}

// Topic component to display each skillpath node
const Topic = ({ topic, onClick }: { topic: SkillPathTopic; onClick: (topic: SkillPathTopic, e: React.MouseEvent) => void }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`relative my-1 ${topic.locked ? 'opacity-50' : ''}`}>
      <Link
        to={topic.locked ? "#" : `/practice?category=${encodeURIComponent(topic.title)}`}
        className={`
          block p-3 rounded-md transition-colors relative
          ${darkMode ? 'bg-indigo-900/30 hover:bg-indigo-800/50' : 'bg-indigo-100 hover:bg-indigo-200'}
          ${topic.completed ? (darkMode ? 'border-l-4 border-green-500' : 'border-l-4 border-green-500') : ''}
        `}
        onClick={(e) => onClick(topic, e)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-xl" aria-hidden="true">{topic.emoji}</span>
            {topic.completed ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : topic.locked ? (
              <Lock className="h-4 w-4 text-gray-500 mr-2" />
            ) : (
              <CircleSlash2 className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <div>
              <span className="font-medium">{topic.title}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">{topic.description}</p>
            </div>
          </div>
          {!topic.locked && <ChevronRight className="h-4 w-4" />}
        </div>
      </Link>
    </div>
  );
};

export function SkillPathPage() {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const { problems, completedProblems } = useProblem();
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SkillPathTopic | null>(null);

  // Get problems by category
  const categoriesData = getProblemsByCategory();

  // Transform the category data into skill path topics
  const skillPathData: SkillPathTopic[] = categoriesData.map(category => {
    const problemsInCategory = category.problems.length;
    const completedInCategory = category.problems.filter(p =>
      completedProblems.includes(p.id)
    ).length;

    return {
      id: category.name.toLowerCase().replace(/\s+/g, '-'),
      title: category.name,
      emoji: category.emoji,
      description: `Master ${category.name.toLowerCase()} concepts and techniques`,
      // Mark as completed if all problems in the category are completed
      completed: isAuthenticated && completedInCategory > 0 && completedInCategory === problemsInCategory,
      problems: problemsInCategory,
      completedProblems: completedInCategory
    };
  });

  // Progress calculation
  const progress = {
    completed: skillPathData.filter(topic => topic.completed).length,
    total: skillPathData.length
  };

  // Handle topic click to show popup
  const handleTopicClick = (topic: SkillPathTopic, e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      setSelectedTopic(topic);
    }
  };

  // Calculate completion percentage safely
  const getCompletionPercentage = (completed?: number, total?: number): number => {
    if (typeof completed !== 'number' || typeof total !== 'number' || total === 0) {
      return 0;
    }
    return (completed / total) * 100;
  };

  // Check if all problems are completed
  const isFullyCompleted = (topic: SkillPathTopic): boolean => {
    return !!topic.completed &&
           typeof topic.completedProblems === 'number' &&
           typeof topic.problems === 'number' &&
           topic.problems > 0 &&
           topic.completedProblems === topic.problems;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main skillpath area */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 font-helvetica">
            <span className="mr-2" role="img" aria-label="Skill Path">🎯</span>
            Skill Path
          </h1>

          <div className="mb-8">
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Skill path grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillPathData.map(topic => (
                  <Topic
                    key={topic.id}
                    topic={topic}
                    onClick={handleTopicClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 shrink-0">
          <Card className={`p-6 ${darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Track Your Progress</h2>

              {isAuthenticated ? (
                <>
                  <p className="text-sm mb-2">
                    ({progress.completed} / {progress.total})
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mb-6">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(progress.completed / progress.total) * 100}%`
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className={`mt-4 p-4 rounded-md ${darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'}`}>
                  <p className="text-sm mb-3">Sign in to see your saved progress</p>
                  <div className="flex flex-col space-y-2">
                    <Link to="/login">
                      <Button size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Don't have an account? <Link to="/signup" className="text-indigo-500 hover:underline">Sign Up</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 mt-6">

              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>

              {showHelp && (
                <div className={`mt-2 p-3 rounded-md text-xs ${darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'}`}>
                  <h3 className="font-bold mb-1">How Skill Path Works</h3>
                  <ul className="space-y-1">
                    <li>• Each card represents a skill you can master</li>
                    <li>• Click a skill to see related challenges</li>
                    <li>• <CheckCircle className="h-3 w-3 text-green-500 inline" /> indicates completed skills</li>
                    <li>• <Lock className="h-3 w-3 text-gray-500 inline" /> shows skills that require prerequisites</li>
                    <li>• Your progress is saved when signed in</li>
                    <li>• Complete all skills to become a coding master!</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Completion Popup */}
      {selectedTopic && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-sm w-full text-center relative ${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
            <button
              onClick={() => setSelectedTopic(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              {isFullyCompleted(selectedTopic) ? (
                <CheckCircle size={48} className="text-green-500" />
              ) : (
                <AlertCircle size={48} className="text-yellow-500" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedTopic.title}</h3>
            <p className="mb-4">
              {selectedTopic.completedProblems ?? 0} of {selectedTopic.problems ?? 0} tasks completed
            </p>
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${getCompletionPercentage(
                    selectedTopic.completedProblems,
                    selectedTopic.problems
                  )}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isFullyCompleted(selectedTopic)
                ? "Congratulations! You've mastered this skill!"
                : "Keep going! You're making progress."}
            </p>

            <Link
              to={`/practice?category=${encodeURIComponent(selectedTopic.title)}`}
              className={`inline-block px-4 py-2 rounded-md ${
                darkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              View Challenges
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
