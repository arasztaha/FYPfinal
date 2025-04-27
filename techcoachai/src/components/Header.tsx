import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { MoonIcon, SunIcon, UserIcon, LogOutIcon, BrainCircuitIcon } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b py-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center">
            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
              <BrainCircuitIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold font-helvetica text-gray-900 dark:text-white">TechCoach AI</span>
          </Link>
          <nav className="hidden md:flex">
            <ul className="flex space-x-4">
              <li>
                <Link
                  to="/practice"
                  className="text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white"
                >
                  Challenges
                </Link>
              </li>
              <li>
                <Link
                  to="/skillpath"
                  className="text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white"
                >
                  Skill Path
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full border-gray-300 dark:border-zinc-700"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <div className="flex items-center space-x-2 rounded-full bg-gray-200 dark:bg-zinc-800 py-1 px-3 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                  <UserIcon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">{user.name}</span>
                </div>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 rounded-full border-gray-300 dark:border-zinc-700"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="default"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="default"
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
