"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Target, Brain, MemoryStick, Eye, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DigitSpanGame from "@/app/components/games/DigitSpanGame";
import StroopGame from "@/app/components/games/StroopGame";
import WordListGame from "@/app/components/games/WordListGame";
import MentalRotationGame from "@/app/components/games/MentalRotationGame";

const gameCategories = [
  {
    id: "attention",
    name: "Attention",
    icon: Target,
    description: "Test your focus and concentration with digit span exercises",
    component: DigitSpanGame,
  },
  {
    id: "executive",
    name: "Executive Function",
    icon: Brain,
    description: "Challenge your cognitive control with the Stroop test",
    component: StroopGame,
  },
  {
    id: "memory",
    name: "Memory",
    icon: MemoryStick,
    description: "Exercise your recall abilities with word list tasks",
    component: WordListGame,
  },
  {
    id: "visuospatial",
    name: "Visuospatial",
    icon: Eye,
    description: "Describe what you see in images to assess visual perception and detect hallucinations",
    component: MentalRotationGame,
  },
];

export default function GamesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated, isProfileComplete } = useAuth();
  const [activeTab, setActiveTab] = useState("attention");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const category = searchParams.get("category");
    if (category && gameCategories.find((c) => c.id === category)) {
      setActiveTab(category);
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted && !loading) {
      if (!isAuthenticated) {
        router.push("/auth");
      } else if (!isProfileComplete) {
        router.push("/profile-setup");
      }
    }
  }, [mounted, loading, isAuthenticated, isProfileComplete, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isProfileComplete) {
    return null;
  }

  const activeCategory = gameCategories.find((cat) => cat.id === activeTab);
  const ActiveGameComponent = activeCategory?.component;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Cognitive Games</h1>
              <p className="text-muted-foreground">
                Challenge your mind and track your cognitive performance
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {gameCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {gameCategories.map((category) => {
              const GameComponent = category.component;
              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-border/50">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <category.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle>{category.name}</CardTitle>
                              <CardDescription>{category.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {GameComponent && <GameComponent />}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

