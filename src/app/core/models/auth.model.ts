export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginData {
  token: string;
  refreshToken: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData | null;
}