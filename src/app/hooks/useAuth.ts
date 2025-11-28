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
    // Only check auth on client side
    if (typeof window !== "undefined") {
      checkAuth();
    }
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
        // Token might be invalid, clear it
        setUser(null);
        removeToken();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't clear token on network errors, only on auth failures
      if (error instanceof TypeError) {
        // Network error, keep token but set user to null temporarily
        setUser(null);
      } else {
        setUser(null);
        removeToken();
      }
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

  const login = async (token: string, userData: User) => {
    // Save token first
    setToken(token);
    // Set user immediately for instant feedback
    setUser(userData);
    setLoading(false);
    // Then verify the token works by checking auth in background (this will update user with full profile)
    // Don't await this to avoid blocking the UI
    checkAuth().catch((error) => {
      console.error("Login verification error:", error);
      // Keep the user data even if checkAuth fails
    });
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

