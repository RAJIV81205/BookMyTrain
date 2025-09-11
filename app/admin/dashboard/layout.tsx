'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error('No authentication token found. Please login.');
        setIsLoading(false);
        router.replace("/admin/auth/login");
        return;
      }

      const verificationPromise = fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            success: 'Welcome back!',
            error: (err) => `${err.message}. Please login again.`,
          }
        );

        if (data?.admin) {
          setAdminUser(data.admin);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid admin data received');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem("adminToken");
        router.replace("/admin/auth/login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Unable to authenticate. Please try again.");
      router.replace("/admin/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          user={adminUser} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
