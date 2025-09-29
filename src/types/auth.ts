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

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  phone?: string;
  rol: "trabajador" | "administrativo";
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

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
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
