'use client';
import { Tabs, TabItem } from '@/components/ui/Tab';
import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

type AuthTab = 'login' | 'signup';

const tabs: TabItem<AuthTab>[] = [
  { id: 'login', label: 'Login' },
  { id: 'signup', label: 'Signup' },
];

export default function LoginModal() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className="max-h-[90vh] z-10 w-full text-black max-w-md bg-white rounded-2xl p-8 shadow-xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Title */}
      {activeTab === 'login' ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back</h2>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Create an account</h2>
        </>
      )}

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth
      />

      {activeTab === 'login' ? (
        <Login />
      ) : (
        <Signup />
      )}

    </div>
  );
}