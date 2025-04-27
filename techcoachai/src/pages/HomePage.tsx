import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '../lib/themeContext';
import { BrainCircuitIcon } from 'lucide-react';

export function HomePage() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? 'bg-[#1f2627] text-white' : 'bg-white text-gray-900'}>
      <div className="container mx-auto px-6 py-16 text-center">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuitIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">TechCoach AI</h1>

          <p className={`text-xl md:text-2xl ${darkMode ? 'text-zinc-300' : 'text-gray-600'} mb-12 max-w-2xl mx-auto`}>
            Bridging the gap between education and industry.
          </p>
        </div>

        {/* Featured Sections */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12">Our Approach</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 dark:bg-zinc-800/40 p-8 rounded-xl border border-gray-200 dark:border-zinc-700">
              <div className="w-16 h-16 bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Practical Learning</h3>
              <p className={`${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                Hands-on practice with real-world coding challenges designed to build industry-relevant skills.
              </p>
            </div>
            <div className="bg-white/5 dark:bg-zinc-800/40 p-8 rounded-xl border border-gray-200 dark:border-zinc-700">
              <div className="w-16 h-16 bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">AI-Powered Feedback</h3>
              <p className={`${darkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                Intelligent guidance and feedback to accelerate learning and develop industry-standard coding practices.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 mb-12">
          <h2 className="text-3xl font-bold mb-6">Ready to start your journey?</h2>
          <p className={`text-xl ${darkMode ? 'text-zinc-300' : 'text-gray-600'} mb-12 max-w-2xl mx-auto`}>
            Join thousands of learners who have successfully transitioned from education to industry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/practice">
              <Button className="rounded-full py-4 px-8 bg-[#425dc5] hover:bg-[#35436b] text-white">
                Start Practicing
              </Button>
            </Link>
            <Link to="/skillpath">
              <Button className="rounded-full py-4 px-8 bg-transparent border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-white">
                Explore Skill Path
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
