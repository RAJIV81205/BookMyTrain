'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { User } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token') || document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      );

      if (!token) {
        toast.error('No authentication token found. Please login.');
        router.push('/auth/login');
        setIsLoading(false);
        return;
      }

      const verificationPromise = fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Session expired';
          throw new Error(errorMessage);
        }
        return response.json();
      });

      try {
        const data = await toast.promise(
          verificationPromise,
          {
            loading: 'Verifying your session...',
            success: 'Welcome back! Session verified successfully.',
            error: (err) => `${err.message}. Please login again.`,
          }
        );

        setIsVerified(true);
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isVerified) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
