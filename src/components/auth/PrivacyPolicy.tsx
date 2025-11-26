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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-[#1E2329] p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Privacy Policy & Terms</h2>
          <div className="prose dark:prose-invert max-w-none h-96 overflow-y-auto mb-6 p-4 bg-gray-50 dark:bg-[#2A2E37] rounded-md">
            <p>Last updated: November 22, 2025</p>
            <h3>1. Introduction</h3>
            <p>Welcome to Stocker. By accessing our website, you agree to be bound by these Terms of Service.</p>
            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Stocker's website for personal, non-commercial transitory viewing only.</p>
            <h3>3. Disclaimer</h3>
            <p>The materials on Stocker's website are provided on an 'as is' basis. Stocker makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            <h3>4. Limitations</h3>
            <p>In no event shall Stocker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Stocker's website.</p>
            {/* Add more dummy content to make it scrollable */}
            <h3>5. Accuracy of materials</h3>
            <p>The materials appearing on Stocker's website could include technical, typographical, or photographic errors. Stocker does not warrant that any of the materials on its website are accurate, complete or current.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Checkbox 
              label="I have read and agree to the Privacy Policy and Terms of Service"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            
            <button
              onClick={handleSubmit}
              disabled={!accepted}
              className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                accepted 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
