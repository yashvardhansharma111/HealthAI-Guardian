"use client";

import { motion } from "framer-motion";
import { Brain, Target, MemoryStick, Eye, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

const gameCategories = [
  {
    id: "attention",
    name: "Attention",
    description: "Test your focus and concentration",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    games: ["Digit Span"],
  },
  {
    id: "executive",
    name: "Executive Function",
    description: "Challenge your cognitive control",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    games: ["Stroop Test"],
  },
  {
    id: "memory",
    name: "Memory",
    description: "Exercise your recall abilities",
    icon: MemoryStick,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    games: ["Word List"],
  },
  {
    id: "visuospatial",
    name: "Visuospatial",
    description: "Assess visual perception and detect hallucinations",
    icon: Eye,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    games: ["Visual Perception"],
  },
];

export default function GamesSection() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Cognitive Games
          </h2>
          <p className="text-muted-foreground mt-1">
            Challenge your mind with brain training games
          </p>
        </div>
        <Button onClick={() => router.push("/games")} className="glow-primary">
          View All Games
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {gameCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 h-full"
                onClick={() => router.push(`/games?category=${category.id}`)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {category.games.map((game) => (
                      <div
                        key={game}
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {game}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

