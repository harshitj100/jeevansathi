'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/globalContext/store';
import { logout } from '@/globalContext/authSlice';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/index'; // Import your Avatar component
import { ScrollToTop } from '@/components/index';

// A simple card component to wrap content
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login'); // Redirect to login after logout
  };

  // Handle case where user data isn't loaded yet
  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <ScrollToTop />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Your Profile
        </h1>
        
        <Card className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar 
            className="w-24 h-24 text-4xl" 
            src="/avatar.png" // Using a default avatar path
            alt="Profile Avatar" 
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {userData.firstname} {userData.lastname}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {userData.email}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              User ID: {userData._id}
            </p>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h3>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </Card>
      </div>
    </div>
  );
}