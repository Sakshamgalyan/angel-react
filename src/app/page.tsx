'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page by default
    // Middleware will handle authenticated users
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
