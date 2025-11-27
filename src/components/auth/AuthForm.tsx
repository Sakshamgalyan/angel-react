'use client';

import { useAuth } from '@/context/auth';
import { useAuthForm } from '@/context/auth/AuthFormContext';
import { Form } from '@/components/ui/Form';
import { FormInput } from '@/components/ui/FormInput';

export default function AuthForm() {
  const {
    isLogin,
    email,
    password,
    name,
    error,
    setIsLogin,
    setEmail,
    setPassword,
    setName,
    setError,
  } = useAuthForm();
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      login(data.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{ background: 'var(--gradient-mesh)' }}
      />
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-slide-in-up">
        {/* Glass card with 3D floating effect */}
        <div className="bg-white/80 dark:bg-[#1E2329]/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl shadow-3d border border-gray-200/50 dark:border-gray-700/50 animate-float">
          <div className="text-center mb-8">
            {/* Logo with gradient */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? 'Sign in to continue your journey' : 'Create an account to get started'}
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative animate-slide-in-down" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <FormInput
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  {isLogin ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign in
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                    </>
                  )}
                </span>
              </button>
            </div>
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-2 animate-fade-in">
          <p>🔒 Secured with end-to-end encryption</p>
          <p className="flex items-center justify-center gap-4">
            <span>✓ Fast & Reliable</span>
            <span>✓ Privacy First</span>
          </p>
        </div>
      </div>
    </div>
  );
}
