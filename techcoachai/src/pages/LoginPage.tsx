import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { BrainCircuitIcon } from 'lucide-react';

export function LoginPage() {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  // If already authenticated, redirect to practice page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/practice');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validate form
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    // Call login from auth context
    const result = await login({ email, password });

    if (!result.success && result.message) {
      setLocalError(result.message);
    }
  };

  return (
    <div className={darkMode ? 'bg-[#1f2627] text-white min-h-screen flex items-center justify-center px-4' : 'bg-white text-gray-900 min-h-screen flex items-center justify-center px-4'}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg ${darkMode ? 'bg-zinc-800/40 border border-zinc-700' : 'bg-white border border-gray-200'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <BrainCircuitIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Sign In to TechCoach AI</h1>
          <p className={`mt-2 ${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
            Sign in to track your progress and access all features
          </p>
        </div>

        {(error || localError) && (
          <div className={`p-3 rounded-md text-sm ${darkMode ? 'bg-red-500/10 border border-red-500 text-red-500' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            {error || localError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${darkMode ? 'border-zinc-700 bg-zinc-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${darkMode ? 'border-zinc-700 bg-zinc-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="********"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className={`text-sm ${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-500 hover:text-indigo-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;