"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Shield, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      // Log for debugging
      if (!response.ok) {
        console.error("Login error:", data);
      }

      if (response.ok && data.success) {
        // Store token in localStorage and update auth state
        const token = data.data?.token;
        const user = data.data?.user;
        
        if (token && user) {
          await login(token, user);
          // Check if profile is complete (has age and gender)
          const hasProfile = user.age && user.gender;
          // Redirect to profile setup if incomplete, otherwise dashboard
          router.push(hasProfile ? "/dashboard" : "/profile-setup");
          router.refresh();
        } else {
          setError("Authentication failed - missing token");
        }
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(", "));
        } else {
          setError(data.message || "Invalid email or password");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black relative overflow-hidden">
  
      {/* 🌟 GLOBAL LIGHT GRID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
        <div className="w-full h-full bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] bg-[size:45px_45px] animate-[gridMove_12s_linear_infinite]"></div>
      </div>
  
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translateY(0px); }
          100% { transform: translateY(45px); }
        }
      `}</style>
  
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
  
        {/* 🌟 LOGIN CARD WITH ITS OWN LIGHT GRID */}
        <Card className="relative bg-white text-black border-black/10 shadow-xl rounded-2xl overflow-hidden">
  
          {/* Sexy soft grid overlay inside card */}
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:30px_30px] animate-[gridMove_10s_linear_infinite]"></div>
          </div>
  
          <CardHeader className="text-center space-y-4 relative z-10">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-black" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              {isLogin ? "Welcome Back" : "Get Started"}
            </CardTitle>
            <CardDescription className="text-base text-gray-700">
              {isLogin
                ? "Sign in to your HealthAI Guardian account"
                : "Create your account to start your health journey"}
            </CardDescription>
          </CardHeader>
  
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
  
              {/* NAME */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="pl-10 bg-white border-black/20 text-black"
                    />
                  </div>
                </div>
              )}
  
              {/* EMAIL */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white border-black/20 text-black"
                  />
                </div>
              </div>
  
              {/* PASSWORD */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white border-black/20 text-black"
                  />
                </div>
              </div>
  
              {/* ERROR */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-md bg-red-100 border border-red-300 text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}
  
              {/* SUBMIT BTN */}
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900 transition rounded-xl shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
  
            {/* SWITCH */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-gray-700 hover:text-black transition"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
  
            {/* HOME */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-black transition"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}  