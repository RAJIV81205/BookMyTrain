'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/Dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token =
          localStorage.getItem('token') ||
          document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            '$1'
          );
        if (!token) {
          toast.error('No authentication token found. Please login.');
          router.push('/auth/login');
          return;
        }
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setIsVerified(true);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Session expired';
          toast.error(errorMessage + '. Please login again.');
          localStorage.removeItem('token');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        toast.error('Please try logging in again.');
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
      <main className="flex-1 p-8" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
