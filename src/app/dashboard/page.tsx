"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GamesSection from "@/app/components/GamesSection";
import HealthSimulator from "@/app/components/HealthSimulator";
import HealthPredictionCard from "@/app/components/HealthPredictionCard";
import QuestionnaireCard from "@/app/components/QuestionnaireCard";
import DashboardAnalytics from "@/app/components/DashboardAnalytics";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isProfileComplete } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!isAuthenticated) {
        router.push("/auth");
      } else if (!isProfileComplete) {
        router.push("/profile-setup");
      } else {
        setCheckingProfile(false);
      }
    }
  }, [mounted, loading, isAuthenticated, isProfileComplete, router]);

  if (!mounted || loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isProfileComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}!</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Health Score</h3>
              <p className="text-3xl font-bold text-primary">85</p>
              <p className="text-sm text-muted-foreground mt-2">Your current health score</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Quests Completed</h3>
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground mt-2">Keep up the great work!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">XP Earned</h3>
              <p className="text-3xl font-bold text-primary">2,450</p>
              <p className="text-sm text-muted-foreground mt-2">Total experience points</p>
            </motion.div>
          </div>

          {/* Health Prediction Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-12"
            id="health-prediction"
          >
            <HealthPredictionCard />
          </motion.div>

          {/* Questionnaire Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.37 }}
            className="mb-12"
          >
            <QuestionnaireCard />
          </motion.div>

          {/* Dashboard Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mb-12"
          >
            <DashboardAnalytics />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <GamesSection />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            id="health-simulator"
          >
            <HealthSimulator />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

