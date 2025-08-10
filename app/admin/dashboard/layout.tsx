// app/admin/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsLoading(false);
        router.replace("/admin/auth/login");
        return;
      }

      const response = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data?.admin) {

        setAdminUser(data.admin);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("adminToken");
        toast.error(data.error || "Session expired. Please login again.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {adminUser?.name}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  toast.success("Logged out successfully");
                  router.replace("/admin/auth/login");
                }}
                className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
