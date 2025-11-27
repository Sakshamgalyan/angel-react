'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { Checkbox } from '@/components/ui/Checkbox';

export default function PrivacyPolicy() {
  const [accepted, setAccepted] = useState(false);
  const { user, updateUser } = useAuth();

  const handleSubmit = async () => {
    if (!accepted || !user) return;

    try {
      const res = await fetch('/api/user/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
      }
    } catch (error) {
      console.error('Failed to accept terms', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{ background: 'var(--gradient-mesh)' }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-400 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-3xl w-full space-y-8 relative z-10 animate-slide-in-up">
        <div className="bg-white/80 dark:bg-[#1E2329]/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl shadow-3d border border-gray-200/50 dark:border-gray-700/50 animate-float">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--gradient-success)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400">
              Privacy Policy & Terms
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please review and accept our terms to continue
            </p>
          </div>

          {/* Scrollable content area with better styling */}
          <div className="bg-gray-50/80 dark:bg-[#0B0E14]/50 rounded-xl p-6 mb-6 h-80 sm:h-96 overflow-y-auto border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last updated: November 22, 2025</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h3>
              <p className="mb-4">Welcome to Stocker. By accessing our website, you agree to be bound by these Terms of Service.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. Use License</h3>
              <p className="mb-4">Permission is granted to temporarily download one copy of the materials (information or software) on Stocker's website for personal, non-commercial transitory viewing only.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Disclaimer</h3>
              <p className="mb-4">The materials on Stocker's website are provided on an 'as is' basis. Stocker makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">4. Limitations</h3>
              <p className="mb-4">In no event shall Stocker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Stocker's website.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">5. Accuracy of materials</h3>
              <p className="mb-4">The materials appearing on Stocker's website could include technical, typographical, or photographic errors. Stocker does not warrant that any of the materials on its website are accurate, complete or current.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">6. Data Protection</h3>
              <p className="mb-4">We are committed to protecting your personal information and your right to privacy. We collect and process your data in accordance with applicable data protection laws.</p>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">7. User Responsibilities</h3>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
            <Checkbox 
              label="I have read and agree to the Privacy Policy and Terms of Service"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            
            <button
              onClick={handleSubmit}
              disabled={!accepted}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all duration-300 transform ${
                accepted 
                  ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                background: accepted ? 'var(--gradient-success)' : '#9CA3AF'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Continue to Dashboard
            </button>
          </div>
        </div>

        {/* Trust indicator */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 animate-fade-in">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
