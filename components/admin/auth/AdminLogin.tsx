"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import z from 'zod'
import { useRouter } from 'next/navigation'

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters')
});

const AdminLogin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Validate input using zod schema
      const validatedData = adminLoginSchema.parse({ email, password });

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(validatedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Admin login failed");
      }

      // Store admin token
      localStorage.setItem("adminToken", data.token);
      
      toast.success("Admin login successful!");
      router.push("/admin/dashboard");

    } catch (error: any) {
      console.error("Admin login error:", error);
      
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const firstError = error.issues[0];
        toast.error(firstError.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 relative font-poppins">
      {/* Admin Background Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(51,65,85,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(51,65,85,0.05) 1px, transparent 1px),
            radial-gradient(circle 600px at 20% 80%, rgba(30,58,138,0.15), transparent),
            radial-gradient(circle 400px at 80% 20%, rgba(79,70,229,0.12), transparent)
          `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%, 100% 100%",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 font-inter">
        <div className="w-full max-w-md">
          {/* Admin Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-8">
            {/* Header with Admin Badge */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Admin Login
              </h1>
              <p className="text-slate-500 text-sm">Access the admin dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    autoComplete='email'
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder-slate-400"
                    placeholder="Enter your admin email"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete='current-password'
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder-slate-400"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-slate-600 font-medium">Remember me</span>
                </label>
                <Link
                  href="/admin/auth/forgot-password"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all text-sm flex items-center justify-center shadow-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </button>
            </form>

            {/* Admin Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-amber-800 font-medium">Admin Access Only</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This portal is restricted to authorized administrators only. 
                    All login attempts are monitored and logged.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to User Login */}
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Not an admin?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  User Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin