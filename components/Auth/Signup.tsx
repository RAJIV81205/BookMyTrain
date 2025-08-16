"use client"

import React, { useState, ChangeEvent } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { z } from 'zod'
import {
  SignupFormData, SignupFormErrors, SignupApiRequest, SignupApiResponse, ApiErrorDetail
} from '@/types/auth'
import { useFirebaseAuth } from '../../lib/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'

// Client-side validation schema to match the API
const signupSchema = z.object({
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
      return age >= 13 && age <= 120;
    }, "Age must be between 13 and 120 years"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: ''
  })
  const { signInWithGoogleAndBackend, loading: firebaseLoading } = useFirebaseAuth();
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof SignupFormErrors]) {
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
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      signupSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: SignupFormErrors = {};
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
            errorMap[field as keyof SignupFormErrors] = issue.message;
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
      // Prepare data for API (match the expected structure)
      const apiData: SignupApiRequest = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email,
        mobile: formData.mobile, // Send as string to match API expectation
        dateOfBirth: formData.dateOfBirth,
        password: formData.password
      };

      const response: Response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const data: SignupApiResponse = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          dateOfBirth: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
        // Optionally redirect to login page
        // router.push('/auth/login');
      } else {
        // Handle API errors
        if (data.details && Array.isArray(data.details)) {
          // Handle validation errors from API
          const errorMap: SignupFormErrors = {};
          data.details.forEach((detail: ApiErrorDetail) => {
            if (detail.field === 'mobile') {
              errorMap['mobile'] = detail.message;
            } else if (detail.field === 'name') {
              errorMap['firstName'] = detail.message;
            } else {
              errorMap[detail.field as keyof SignupFormErrors] = detail.message;
            }
          });
          setErrors(errorMap);
          toast.error('Please fix the form errors');
        } else {
          toast.error(data.message || data.error || 'Failed to create account');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleFirebaseGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogleAndBackend();
      if (result) {
        console.log('=== Complete Google Authentication Success ===');
        console.log('User:', result.user.displayName, result.user.email);
        console.log('JWT Token received and stored');

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      // Error messages are already handled in the hook
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Dual Gradient Overlay Background */}
      <div
        className="absolute inset-0 z-0 blur-sm"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 font-poppins">
        <div className="w-full max-w-md">
          {/* Signup Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 text-sm">Create account for hassle free booking</p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      autoComplete='off'
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.firstName
                          ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                          : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete='off'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.lastName
                          ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                          : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete='off'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.email
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
                      }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Mobile Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    autoComplete='off'
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.mobile
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
                      }`}
                    placeholder="Enter 10-digit mobile number"
                    required
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                )}
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    autoComplete='off'
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.dateOfBirth
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
                      }`}
                    required
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    autoComplete='off'
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.password
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
                      }`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete='off'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 transition-colors text-sm ${errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-300'
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
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
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
                  className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-1 mt-0.5"
                  required
                />
                <div className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-gray-900 hover:underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-gray-900 hover:underline font-medium">
                    Privacy Policy
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full font-medium py-2.5 px-4 rounded-md transition-colors text-sm ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                disabled={isLoading || firebaseLoading}
                onClick={handleFirebaseGoogleSignIn}
              >
                {firebaseLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </>
                )}
              </button>

              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm">
                <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-gray-900 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
