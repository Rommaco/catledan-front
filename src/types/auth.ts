export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export type UserProfile = 'user' | 'super_user' | 'analytics' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  phone?: string;
  profile: UserProfile;
  plan?: "free" | "pro";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterResult {
  requiresConfirmation?: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse | RegisterResult>;
  confirmSignUp: (email: string, confirmationCode: string, password: string) => Promise<AuthResponse>;
  googleLogin: (token: string) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
  updatePlan: (plan: "free" | "pro") => Promise<AuthResponse>;
}

export type AuthError = {
  message: string;
  type: 'credentials' | 'rateLimit' | 'network' | 'unknown';
  retryTime?: number;
}
