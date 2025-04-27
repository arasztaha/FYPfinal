import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getProblemsByCategory } from '@/data/problems';
import { useTheme } from '../lib/themeContext';
import { useProblem } from '../lib/problemContext';
import { SearchIcon, CheckCircle2, Zap, BookOpen, BookOpenCheck, CodeSquare} from 'lucide-react';
import { useAuth } from '../lib/authContext';

export function PracticePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { darkMode } = useTheme();
  const { problems, completedProblems, getCompletedCount, getCompletedCountByDifficulty } = useProblem();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  // Set search query based on category parameter if present
  useEffect(() => {
    if (categoryParam) {
      setSearchQuery(categoryParam);
    }
  }, [categoryParam]);

  // Get problems by category
  const categoriesWithProblems = getProblemsByCategory();

  // Add completion status to problems based on our context
  const categories = categoriesWithProblems.map(category => ({
    ...category,
    problems: category.problems.map(problem => ({
      ...problem,
      completed: completedProblems.includes(problem.id)
    }))
  }));

  // Filter problems based on search query
  const filteredCategories = searchQuery
    ? categories.map(category => ({
        ...category,
        problems: category.problems.filter(problem =>
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.problems.length > 0)
    : categories;

  // Badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-600 hover:bg-green-700';
      case 'Medium':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'Hard':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // Calculate total problems
  const totalProblems = categories.reduce((acc, category) => acc + category.problems.length, 0);
  const totalCompleted = getCompletedCount();

  // Get completion data for each difficulty level
  const easyStats = getCompletedCountByDifficulty('Easy');
  const mediumStats = getCompletedCountByDifficulty('Medium');
  const hardStats = getCompletedCountByDifficulty('Hard');

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-4">
            <h3 className="font-medium mb-2">Practice Problems</h3>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 py-2 bg-transparent border border-gray-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm p-4">
            <h3 className="font-medium mb-2">Stats</h3>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Easy</div>
                <div className="flex items-center">
                  <div className="text-sm mr-2">{easyStats.completed} / {easyStats.total}</div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${easyStats.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Medium</div>
                <div className="flex items-center">
                  <div className="text-sm mr-2">{mediumStats.completed} / {mediumStats.total}</div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                    <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: `${mediumStats.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Hard</div>
                <div className="flex items-center">
                  <div className="text-sm mr-2">{hardStats.completed} / {hardStats.total}</div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                    <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${hardStats.percentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Welcome section - replaces the Courses section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to TechCoach AI Challenges 🚀</h1>
            <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 dark:from-green-900/40 dark:to-blue-900/40 p-6 rounded-lg border border--200 dark:border--900 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-white dark:bg-zinc-800 rounded-full p-4 shadow-md">
                  <CodeSquare className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Level Up Your Coding Skills</h2>
                  <p className="mb-3 text-gray-600 dark:text-zinc-300">
                    Sharpen your problem-solving abilities with our carefully curated coding challenges.
                    From beginner to advanced, we've got challenges that will push your limits and expand your knowledge.
                  </p>

                  {isAuthenticated ? (
                    <div className="flex items-center p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
                      <BookOpenCheck className="h-5 w-5 mr-2" />
                      <span>Your progress is being tracked! Complete challenges to see your mastery grow.</span>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md">
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span><Link to="/signup" className="underline font-medium">Sign up</Link> or <Link to="/login" className="underline font-medium">log in</Link> to track your progress and save your achievements!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Programming Challenges Section - renamed from Core Skills */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Programming Challenges
              </h2>
              <div className="inline-flex items-center justify-center bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1 text-sm">
                <span className="font-bold mr-1">{totalCompleted}</span> / {totalProblems}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
              <div className="text-sm text-gray-500 dark:text-zinc-400 flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Master algorithms, data structures, and design patterns through hands-on practice.
              </div>

              {/* Task overview header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-center">📚 Coding Challenges Library</h2>
              </div>

              {/* Problem lists */}
              {filteredCategories.map((category, categoryIndex) => (
                <div key={category.name} className="mb-8">
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <span className="mr-2">{category.emoji}</span> {category.name}
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-zinc-800">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-500 dark:text-zinc-400 w-16">Status</th>
                          <th className="p-3 text-left font-medium text-gray-500 dark:text-zinc-400">Problem</th>
                          <th className="p-3 text-right font-medium text-gray-500 dark:text-zinc-400">Difficulty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800/50">
                        {category.problems.map((problem) => (
                          <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/30">
                            <td className="p-3">
                              {problem.completed ? (
                                <div className="text-lg text-green-500">
                                  <CheckCircle2 size={20} />
                                </div>
                              ) : (
                                <div className="text-lg">⬜</div>
                              )}
                            </td>
                            <td className="p-3">
                              <Link to={`/problems/${problem.slug}`} className="hover:text-blue-600 dark:hover:text-[#425dc5]">
                                {problem.title}
                              </Link>
                            </td>
                            <td className="p-3 text-right">
                              <Badge className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-medium">No problems found</h3>
                  <p className="text-gray-500 dark:text-zinc-400">Try adjusting your search query</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
