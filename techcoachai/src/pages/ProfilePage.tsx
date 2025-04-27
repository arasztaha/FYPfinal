import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { useProblem } from '../lib/problemContext';
import { Card } from '@/components/ui/card';
import {
  UserIcon,
  BookOpenCheck,
  BarChart4,
  Trophy
} from 'lucide-react';
import { problems, getProblemsByCategory } from '../data/problems';

// Helper function to format a date string
const formatDateString = (dateString: string | undefined) => {
  if (dateString) {
    return new Date(dateString).toLocaleDateString();
  }
  return new Date().toLocaleDateString();
};

// Extract unique categories from problems
const getUniqueCategories = (): string[] => {
  const categories = new Set<string>();
  problems.forEach(problem => categories.add(problem.category));
  return Array.from(categories);
};

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { darkMode } = useTheme();
  const { completedProblems } = useProblem();
  const [creationDate, setCreationDate] = useState<string>('');
  const [categoriesData, setCategoriesData] = useState<{ name: string, totalProblems: number, completed: number, emoji: string }[]>([]);
  const [streak, setStreak] = useState(0);

  // Load data
  useEffect(() => {
    if (isAuthenticated && user) {
      // Try to load user creation date from localStorage
      const userCreationKey = `userCreationDate_${user.id}`;
      let date = localStorage.getItem(userCreationKey);

      // If no creation date is found, set it to now (for existing users)
      if (!date) {
        date = new Date().toISOString();
        localStorage.setItem(userCreationKey, date);
      }

      setCreationDate(date);

      // Organize problems by category
      const categories = getUniqueCategories();
      const categoryData = categories.map(category => {
        const categoryProblems = problems.filter(p => p.category === category);
        const completedCount = categoryProblems.filter(p =>
          completedProblems?.includes(p.id)
        ).length;

        const emoji = categoryProblems[0]?.categoryEmoji || "📚";

        return {
          name: category,
          totalProblems: categoryProblems.length,
          completed: completedCount,
          emoji: emoji
        };
      });

      setCategoriesData(categoryData);

      // For demo purposes, calculate a streak based on completed problems
      // In a real app, you would track daily activity
      setStreak(Math.min(7, Math.max(1, completedProblems?.length || 0)));
    }
  }, [isAuthenticated, user, completedProblems]);

  // Calculate total problems and completed
  const totalProblems = problems.length;
  const totalCompleted = completedProblems?.length || 0;

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Available</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl">
            {user?.name?.charAt(0) || <UserIcon size={32} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
            <p className="text-gray-500 dark:text-gray-400">{user?.email || 'No email'}</p>
            <div className="mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Member since {formatDateString(creationDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className={`p-4 ${darkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
              <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Skills Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {categoriesData.filter(cat => cat.completed > 0).length} of {categoriesData.length} categories started
              </p>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(categoriesData.filter(cat => cat.completed > 0).length / categoriesData.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${darkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <BarChart4 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Challenge Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalCompleted} of {totalProblems} challenges solved
              </p>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(totalCompleted / totalProblems) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${darkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
              <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Streak</h3>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">{streak}</span>
                <span className="text-lg">🔥</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Keep it going!</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Skill Categories */}
      <h2 className="text-xl font-bold mb-4">Skill Categories</h2>
      <Card className={`p-4 ${darkMode ? 'bg-zinc-800/50' : 'bg-gray-50'} mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesData.map((category) => (
            <div
              key={category.name}
              className={`p-3 rounded-lg border flex items-center ${
                category.completed > 0
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                  : 'border-gray-200 dark:border-zinc-700'
              }`}
            >
              <span className="mr-2 text-xl">
                {category.emoji}
              </span>
              <div className="flex-1">
                <span className={category.completed > 0 ? 'font-medium' : ''}>
                  {category.name}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {category.completed} of {category.totalProblems} completed
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1 mt-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${(category.completed / category.totalProblems) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Problem Difficulty Breakdown */}
      <h2 className="text-xl font-bold mb-4">Problem Difficulty</h2>
      <Card className={`p-4 ${darkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Easy", "Medium", "Hard"].map((difficulty) => {
            const difficultyProblems = problems.filter(p => p.difficulty === difficulty);
            const completed = difficultyProblems.filter(p =>
              completedProblems?.includes(p.id)
            ).length;

            return (
              <div key={difficulty} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${
                    difficulty === 'Easy'
                      ? 'text-green-600 dark:text-green-400'
                      : difficulty === 'Medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {difficulty}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {completed} of {difficultyProblems.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      difficulty === 'Easy'
                        ? 'bg-green-500'
                        : difficulty === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(completed / difficultyProblems.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
