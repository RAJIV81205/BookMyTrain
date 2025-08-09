"use client"

import React, { useState, ChangeEvent } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Shield, Building } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { z } from 'zod'

// Admin-specific form data types
interface AdminSignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  department: string;
  employeeId: string;
  password: string;
  confirmPassword: string;
}

interface AdminSignupFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  department?: string;
  employeeId?: string;
  password?: string;
  confirmPassword?: string;
}

interface AdminSignupApiRequest {
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  department: string;
  employeeId: string;
  password: string;
}

interface AdminSignupApiResponse {
  message?: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Client-side validation schema for admin
const adminSignupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email format")
    .min(1, "Email is required"),
  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit number starting with 6-9"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - selectedDate.getFullYear();
      return age >= 18 && age <= 65;
    }, "Age must be between 18 and 65 years for admin access"),
  department: z.string()
    .min(1, "Department is required")
    .max(50, "Department name is too long"),
  employeeId: z.string()
    .min(3, "Employee ID must be at least 3 characters")
    .max(20, "Employee ID is too long")
    .regex(/^[A-Za-z0-9]+$/, "Employee ID can only contain letters and numbers"),
  password: z.string()
    .min(8, "Admin password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AdminSignup: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<AdminSignupFormErrors>({})
  const [formData, setFormData] = useState<AdminSignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    department: '',
    employeeId: '',
    password: '',
    confirmPassword: ''
  })

  const departments = [
    'IT & Technology',
    'Human Resources',
    'Finance & Accounting',
    'Operations',
    'Marketing',
    'Customer Support',
    'Security',
    'Management'
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else if (name === "employeeId") {
      // Convert to uppercase for employee ID
      setFormData({
        ...formData,
        [name]: value.toUpperCase(),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof AdminSignupFormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      // Combine first and last name for validation
      const dataToValidate = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department,
        employeeId: formData.employeeId,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      adminSignupSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: AdminSignupFormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          // Map validation errors to form field names
          if (field === 'name') {
            if (!formData.firstName.trim()) {
              errorMap['firstName'] = 'First name is required';
            }
            if (!formData.lastName.trim()) {
              errorMap['lastName'] = 'Last name is required';
            }
            if (!errorMap['firstName'] && !errorMap['lastName']) {
              errorMap['firstName'] = issue.message;
            }
          } else if (field === 'mobile') {
            errorMap['mobile'] = issue.message;
          } else {
            errorMap[field as keyof AdminSignupFormErrors] = issue.message;
          }
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    // Prevent double submission
    if (isLoading) return;

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const apiData: AdminSignupApiRequest = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department,
        employeeId: formData.employeeId,
        password: formData.password
      };

      const response: Response = await fetch('/api/auth/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const data: AdminSignupApiResponse = await response.json();

      if (response.ok) {
        toast.success('Admin account created successfully! Please wait for approval.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          dateOfBirth: '',
          department: '',
          employeeId: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
      } else {
        // Handle API errors
        if (data.details && Array.isArray(data.details)) {
          const errorMap: AdminSignupFormErrors = {};
          data.details.forEach((detail) => {
            if (detail.field === 'mobile') {
              errorMap['mobile'] = detail.message;
            } else if (detail.field === 'name') {
              errorMap['firstName'] = detail.message;
            } else {
              errorMap[detail.field as keyof AdminSignupFormErrors] = detail.message;
            }
          });
          setErrors(errorMap);
          toast.error('Please fix the form errors');
        } else {
          toast.error(data.message || data.error || 'Failed to create admin account');
        }
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
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
        <div className="w-full max-w-lg">
          {/* Admin Signup Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-8">
            {/* Header with Admin Badge */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Admin Registration
              </h1>
              <p className="text-slate-500 text-sm">Create your administrator account</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      autoComplete='off'
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                        errors.firstName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="First name"
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete='off'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                        errors.lastName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Last name"
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete='off'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your official email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Mobile and Employee ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      autoComplete='off'
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                        errors.mobile 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Employee ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="employeeId"
                      autoComplete='off'
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                        errors.employeeId 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="e.g., EMP001"
                      required
                    />
                  </div>
                  {errors.employeeId && (
                    <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>
                  )}
                </div>
              </div>

              {/* Department and Date of Birth */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.department 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      name="dateOfBirth"
                      autoComplete='off'
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 65)).toISOString().split('T')[0]}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                        errors.dateOfBirth 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                  )}
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
                    name="password"
                    value={formData.password}
                    autoComplete='off'
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Must contain uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete='off'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm placeholder-slate-400 ${
                      errors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                  required
                />
                <div className="ml-3 text-sm text-slate-600">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                    Admin Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                    Privacy Policy
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all text-sm shadow-sm ${
                  isLoading
                    ? 'bg-slate-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </button>
            </div>

            {/* Admin Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-blue-800 font-medium">Admin Account Approval</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your admin account will require approval from a super administrator 
                    before you can access the admin panel. You will be notified via email 
                    once your account is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Already have an admin account?{" "}
                <Link
                  href="/admin/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to User Portal */}
            <div className="text-center mt-4">
              <p className="text-slate-500 text-xs">
                Looking for user registration?{" "}
                <Link
                  href="/auth/signup"
                  className="text-slate-600 hover:text-slate-800 font-medium"
                >
                  User Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSignup