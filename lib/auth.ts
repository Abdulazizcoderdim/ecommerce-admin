import axios, { AxiosRequestConfig } from "axios";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "operator" | "user";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    role?: string
  ): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register`,
        { username, email, password, role },
        { withCredentials: true }
      );

      this.setAccessToken(response.data.accessToken);
      return response.data;
    } catch (error) {
      throw new Error("Registration failed");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      this.setAccessToken(response.data.accessToken);
      return response.data;
    } catch (error) {
      throw new Error("Login failed");
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post<{ accessToken: string }>(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      this.setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      throw new Error("Token refresh failed");
    }
  }

  async logout(): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        withCredentials: true,
      }
    );

    this.clearAccessToken();
  }

  private setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async makeAuthenticatedRequest<T = any>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await axios({
        url,
        ...options,
        withCredentials: true,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          return this.makeAuthenticatedRequest<T>(url, options);
        } catch {
          this.clearAccessToken();
          throw new Error("Authentication failed");
        }
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
