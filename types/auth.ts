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



// API Request Types
export interface SignupApiRequest {
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
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
}

export interface SignupApiResponse {
  message?: string;
  error?: string;
  details?: ApiErrorDetail[];
  user?: User;
}

