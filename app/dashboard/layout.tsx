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
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token =
        localStorage.getItem('token') ||
        document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
          '$1'
        );

      if (!token) {
        toast.error('No authentication token found. Please login.');
        router.push('/auth/login');
        setIsLoading(false);
        return;
      }

      // Create the verification promise
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

      // Use toast.promise for the verification process
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
        // Set user data if it's returned from the API
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
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );
  }

  if (!isVerified) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-68">
        <DashboardHeader user={user} />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

