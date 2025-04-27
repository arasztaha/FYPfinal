import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios, { type AxiosError } from 'axios';
import { type AuthState, User, type LoginCredentials, type RegisterCredentials } from './types';
import { AUTH_API_URL, MOCK_AUTH } from './constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Changed to false when using mock auth
  error: null,
};

// Mock users for development
const MOCK_USERS = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  },
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clear all completed problems from a previous session
function clearAllCompletedProblems() {
  // Find all the completedProblems keys in localStorage
  const completedProblemKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('completedProblems_')) {
      completedProblemKeys.push(key);
    }
  }

  // Remove all completedProblems entries
  for (const key of completedProblemKeys) {
    localStorage.removeItem(key);
  }

  console.log(`Cleared ${completedProblemKeys.length} completed problem entries from localStorage`);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Load user on first render
  useEffect(() => {
    const loadUser = async () => {
      // If using mock auth, check localStorage only
      if (MOCK_AUTH) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            // Invalid stored user, clear it
            localStorage.removeItem('user');
            setState(prevState => ({
              ...prevState,
              isLoading: false,
            }));
          }
        } else {
          setState(prevState => ({
            ...prevState,
            isLoading: false,
          }));
        }
        return;
      }

      // Real API auth
      try {
        // Get current user from API
        const response = await axios.get(`${AUTH_API_URL}/me`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setState(prevState => ({
            ...prevState,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          setState(prevState => ({
            ...prevState,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (credentials: RegisterCredentials) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    // If using mock auth, handle registration locally
    if (MOCK_AUTH) {
      // Convert email to lowercase for case-insensitive comparison
      const normalizedEmail = credentials.email.toLowerCase();
      const normalizedCredentials = {
        ...credentials,
        email: normalizedEmail
      };

      // Simple validation
      if (!normalizedCredentials.name || !normalizedCredentials.email || !normalizedCredentials.password) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'All fields are required',
        }));
        return { success: false, message: 'All fields are required' };
      }

      // Check if email is already in use (case-insensitive)
      const existingUser = MOCK_USERS.find(
        user => user.email.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'Email already exists',
        }));
        return { success: false, message: 'Email already exists' };
      }

      // Create new user
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        name: normalizedCredentials.name,
        email: normalizedEmail, // Store email in lowercase
        password: normalizedCredentials.password, // In a real app, this would be hashed
      };

      // Add to mock users
      MOCK_USERS.push(newUser);

      // Clear all completed problems from localStorage when registering a new user
      clearAllCompletedProblems();

      // Store user in local storage (excluding password)
      const userForStorage = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      localStorage.setItem('user', JSON.stringify(userForStorage));

      // Store user creation date
      const creationDate = new Date().toISOString();
      localStorage.setItem(`userCreationDate_${newUser.id}`, creationDate);

      setState({
        user: userForStorage,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    }

    // Real API registration
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, credentials, {
        withCredentials: true,
      });

      if (response.data.success) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: response.data.message || 'Registration failed',
      }));
      return { success: false, message: response.data.message };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Registration failed. Please try again.';
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    // If using mock auth, handle login locally
    if (MOCK_AUTH) {
      // Convert email to lowercase for case-insensitive comparison
      const normalizedEmail = credentials.email.toLowerCase();

      // Find user by email (case-insensitive)
      const user = MOCK_USERS.find(
        user => user.email.toLowerCase() === normalizedEmail &&
        user.password === credentials.password
      );

      if (user) {
        // Store user in local storage (excluding password)
        const userForStorage = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        localStorage.setItem('user', JSON.stringify(userForStorage));

        setState({
          user: userForStorage,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }

      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Invalid credentials',
      }));
      return { success: false, message: 'Invalid credentials' };
    }

    // Real API login
    try {
      // For API calls, convert email to lowercase before sending
      const normalizedCredentials = {
        ...credentials,
        email: credentials.email.toLowerCase()
      };

      const response = await axios.post(`${AUTH_API_URL}/login`, normalizedCredentials, {
        withCredentials: true,
      });

      if (response.data.success) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: response.data.message || 'Login failed',
      }));
      return { success: false, message: response.data.message };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Login failed. Please try again.';
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    // Preserve current user information before it's cleared
    const currentUser = state.user;

    // If using mock auth, just clear localStorage
    if (MOCK_AUTH) {
      // Clear only the user info - the problem context will handle reset of problem state
      localStorage.removeItem('user');

      // DO NOT clear the user's completed problems when logging out
      // This way the progress will be restored when they log back in

      // We'll set to empty state here, and the ProblemContext will handle resetting when it detects the user change
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Real API logout
    try {
      await axios.post(`${AUTH_API_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  // Clear error
  const clearError = () => {
    setState(prevState => ({ ...prevState, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
