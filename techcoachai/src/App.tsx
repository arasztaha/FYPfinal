import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { PracticePage } from './pages/PracticePage';
import { ProblemPage } from './pages/ProblemPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { SkillPathPage } from './pages/SkillPathPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthProvider } from './lib/authContext';
import { ThemeProvider } from './lib/themeContext';
import { TaskProvider } from './lib/taskContext';
import { ProblemProvider } from './lib/problemContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <ProblemProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/problems/:slug" element={<ProblemPage />} />
                    <Route path="/skillpath" element={<SkillPathPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </ProblemProvider>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
