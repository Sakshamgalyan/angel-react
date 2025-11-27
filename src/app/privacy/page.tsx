'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { acceptPrivacy } from '@/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/store/store';

export default function PrivacyPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const result = await dispatch(acceptPrivacy());
    
    if (acceptPrivacy.fulfilled.match(result)) {
      router.push('/home');
    }
    setLoading(false);
  };

  const handleDecline = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-slate-900 dark:via-background dark:to-slate-800 px-4 py-12">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome, {user?.name || user?.email}! Please review our privacy policy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-slate dark:prose-invert max-w-none mb-8 space-y-4 text-foreground/90"
          >
            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Collection</h2>
              <p className="leading-relaxed">
                We collect and process your personal information including your name, email address, 
                and usage data to provide you with our services. Your data is stored securely and 
                encrypted in our database.
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Usage</h2>
              <p className="leading-relaxed">
                Your information is used to personalize your experience, improve our services, 
                and communicate important updates. We do not sell your personal data to third parties.
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights</h2>
              <p className="leading-relaxed">
                You have the right to access, modify, or delete your personal data at any time. 
                You can also opt out of non-essential communications and request a copy of your data.
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures including encryption, secure authentication, 
                and regular security audits to protect your information from unauthorized access.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAccept}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Accept & Continue'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDecline}
              disabled={loading}
              className="px-8 py-3 bg-background/50 hover:bg-background border border-border text-foreground font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decline
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            By accepting, you agree to our privacy policy and terms of service.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
