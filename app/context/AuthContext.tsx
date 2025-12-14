"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cookie functions
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // Initialize auth state from localStorage and cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getCookie("auth_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const userData = JSON.parse(userStr);

          // Verify token is still valid by calling profile endpoint
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setUser(result.data);
            localStorage.setItem("user", JSON.stringify(result.data));
          } else {
            // Token invalid, clear auth
            localStorage.removeItem("user");
            deleteCookie("auth_token");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("user");
        deleteCookie("auth_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Save token to cookie
        setCookie("auth_token", result.data.token, 7);

        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Update state
        setUser(result.data.user);

        return { success: true };
      } else {
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Save token to cookie
        setCookie("auth_token", result.data.token, 7);

        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Update state
        setUser(result.data.user);

        return { success: true };
      } else {
        return { success: false, error: result.error || "Registration failed" };
      }
    } catch (error: any) {
      console.error("Register error:", error);
      return { success: false, error: "Network error" };
    }
  };

  // Logout function
  const logout = () => {
    // Clear cookie
    deleteCookie("auth_token");

    // Clear localStorage
    localStorage.removeItem("user");

    // Clear state
    setUser(null);

    // Redirect to login
    router.push("/login");
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
