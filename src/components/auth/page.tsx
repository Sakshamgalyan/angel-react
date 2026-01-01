// 'use client';

// import { useAuth } from '@/context/auth';
// import AuthForm from '@/components/auth/AuthForm';
// import HomePage from '@/components/home/HomePage';

// export default function Home() {
//   const { user, isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E14]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <AuthForm />;
//   }

//   if (user && !user.hasAcceptedTerms) {
//     return <PrivacyPolicy />;
//   }

//   return <HomePage />;
// }