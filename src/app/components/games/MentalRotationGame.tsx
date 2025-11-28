"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Card } from "@/app/components/ui/card";
import { useAuth } from "@/app/hooks/useAuth";
import { Loader2, Play, RotateCcw, Eye } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import Image from "next/image";

interface Question {
  id: number;
  question: string;
  data: {
    imageUrl: string;
  };
}

export default function MentalRotationGame() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userDescription, setUserDescription] = useState("");
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const startGame = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("/api/games/visuospatial/mental-rotation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load game");

      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestion(0);
      setGameState("playing");
      setUserDescription("");
      setStartTime(Date.now());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe what you see in the image",
        variant: "destructive",
      });
      return;
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const currentQ = questions[currentQuestion];

    setReactionTime(timeTaken);
    setGameState("result");

    // Save result
    try {
      const token = getToken();
      await fetch("/api/games/visuospatial/mental-rotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQ.id,
          userDescription: userDescription.trim(),
          imageUrl: currentQ.data.imageUrl,
          reactionTime: timeTaken,
        }),
      });

      toast({
        title: "Response Saved",
        description: "Your description has been recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive",
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setGameState("playing");
      setUserDescription("");
      setStartTime(Date.now());
    } else {
      setGameState("idle");
      toast({
        title: "Game Complete!",
        description: `You've completed all ${questions.length} questions`,
      });
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {gameState === "idle" && (
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center mb-4">
            <Eye className="w-12 h-12 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Look at each image carefully and describe in detail what you see. 
            This test helps assess visual perception and can detect visual hallucinations.
          </p>
          <Button onClick={startGame} disabled={loading} className="glow-primary" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </>
            )}
          </Button>
        </div>
      )}

      {gameState === "playing" && currentQ && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 py-8"
        >
          <div className="text-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <p className="text-lg font-semibold mb-6">{currentQ.question}</p>
            </div>

            <Card className="p-6 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {currentQ.data.imageUrl ? (
                    <Image
                      src={currentQ.data.imageUrl}
                      alt="Visual perception test image"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Loading image...
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Describe what you see in this image:
                </label>
                <Textarea
                  id="description"
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="Be specific about objects, people, colors, shapes, and any other details you notice..."
                  className="min-h-[120px] resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Take your time to observe carefully. Include as much detail as possible.
                </p>
              </div>
              <Button onClick={handleSubmit} className="glow-primary w-full">
                Submit Description
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {gameState === "result" && currentQ && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 py-8"
        >
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Eye className="w-16 h-16 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-2">Response Recorded</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your description: "{userDescription}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Time taken: {reactionTime.toFixed(2)}s
                </p>
              </div>
              <Button onClick={nextQuestion} className="glow-primary">
                {currentQuestion < questions.length - 1 ? "Next Image" : "Finish"}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {questions.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Progress: {currentQuestion + (gameState === "result" ? 1 : 0)}/{questions.length}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGameState("idle");
              setQuestions([]);
              setCurrentQuestion(0);
              setUserDescription("");
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
