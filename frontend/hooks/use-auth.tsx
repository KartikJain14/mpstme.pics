"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = () => {
      const currentUser = api.getCurrentUser();
      const token = localStorage.getItem("auth_token");

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };

      const cookieToken = getCookie("auth_token");

      // If we have user data, ensure tokens are synced
      if (currentUser) {
        if (token && !cookieToken) {
          // Cookie missing but we have localStorage token - restore cookie
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        } else if (!token && cookieToken) {
          // localStorage missing but we have cookie - restore localStorage
          localStorage.setItem("auth_token", cookieToken);
        } else if (!token && !cookieToken) {
          // No token anywhere - force logout
          api.logout();
          setUser(null);
          return;
        }
      }

      setUser(currentUser);
    };

    // Check auth state initially
    checkAuthState();
    setLoading(false);

    // Re-check auth when window gets focus
    window.addEventListener("focus", checkAuthState);
    return () => window.removeEventListener("focus", checkAuthState);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
