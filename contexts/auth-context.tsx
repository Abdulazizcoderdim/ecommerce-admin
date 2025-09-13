"use client";

import { API_BASE_URL, type User, authService } from "@/lib/auth";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.refreshToken();
          // In a real app, you'd decode the JWT to get user info
          // For now, we'll set a placeholder user
          const user = await authService.makeAuthenticatedRequest(
            API_BASE_URL + "/users/current"
          );
          setUser({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          });
        } catch {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role?: string
  ) => {
    const response = await authService.register(
      username,
      email,
      password,
      role
    );
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
