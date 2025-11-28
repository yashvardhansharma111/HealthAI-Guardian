"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
}

const TOKEN_KEY = "auth_token";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  };

  const setToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  };

  const removeToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  };

  const checkAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
          removeToken();
        }
      } else {
        setUser(null);
        removeToken();
      }
    } catch (error) {
      setUser(null);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = getToken();
      if (!token) return null;

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          return data.data.user;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const isProfileComplete = (): boolean => {
    return !!(user?.age && user?.gender);
  };

  const login = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage and state
      removeToken();
      setUser(null);
      window.location.href = "/";
    }
  };

  return { 
    user, 
    loading, 
    checkAuth, 
    login,
    logout, 
    isAuthenticated: !!user,
    getToken,
    fetchProfile,
    isProfileComplete: isProfileComplete(),
  };
}

