// types/auth.ts

// Form Data Types
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Form Error Types
export interface SignupFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  password?: string;
  confirmPassword?: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

// API Request Types
export interface SignupApiRequest {
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  password: string;
}

export interface LoginApiRequest {
  email: string;
  password: string;
}

// API Response Types
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: number;
  dateOfBirth: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SignupApiResponse {
  message?: string;
  error?: string;
  details?: ApiErrorDetail[];
  user?: User;
}

export interface LoginApiResponse {
  message?: string;
  error?: string;
  details?: ApiErrorDetail[];
  user?: User;
  token?: string;
}

// Database Model Types (for backend)
export interface UserModel {
  _id: string;
  name: string;
  email: string;
  password: string;
  mobile: number;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

// Validation Schema Types (for Zod)
export interface SignupValidationData {
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface LoginValidationData {
  email: string;
  password: string;
}

// Component Props Types
export interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  min?: string;
  max?: string;
}

export interface AuthButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
}

// Context Types (for Auth Context)
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginApiRequest) => Promise<void>;
  signup: (userData: SignupApiRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// HTTP Response Types
export interface ApiError {
  error: string;
  message: string;
  details?: ApiErrorDetail[];
  statusCode: number;
}

export interface ApiSuccess<T = any> {
  message: string;
  data?: T;
  statusCode: number;
}

// Form Validation Types
export type FormFieldName = keyof SignupFormData | keyof LoginFormData;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Component State Types
export interface SignupComponentState {
  formData: SignupFormData;
  errors: SignupFormErrors;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface LoginComponentState {
  formData: LoginFormData;
  errors: LoginFormErrors;
  isLoading: boolean;
  showPassword: boolean;
}

// Event Handler Types
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type FormSubmitHandler = () => Promise<void>;
export type TogglePasswordHandler = () => void;