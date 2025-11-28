"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useAuth } from "@/app/hooks/useAuth";
import { Loader2, CheckCircle2, XCircle, Play, RotateCcw } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  data: { word: string; inkColor: string };
  meta: any;
}

const COLORS = ["red", "blue", "green", "yellow"];

export default function StroopGame() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "playing" | "result">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const startGame = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("/api/games/executive/stroop", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load game");

      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestion(0);
      setGameState("playing");
      setScore(0);
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

  const handleAnswer = async (selectedColor: string) => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedColor === currentQ.data.inkColor;

    setReactionTime(timeTaken);
    setGameState("result");

    // Save result
    try {
      const token = getToken();
      await fetch("/api/games/executive/stroop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQ.id,
          word: currentQ.data.word,
          inkColor: currentQ.data.inkColor,
          userAnswer: selectedColor,
          reactionTime: timeTaken,
        }),
      });

      if (isCorrect) {
        setScore(score + 1);
        toast({
          title: "Correct!",
          description: "Well done!",
        });
      } else {
        toast({
          title: "Incorrect",
          description: "The ink color was " + currentQ.data.inkColor,
          variant: "destructive",
        });
      }
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
      setStartTime(Date.now());
    } else {
      setGameState("idle");
      toast({
        title: "Game Complete!",
        description: `Score: ${score}/${questions.length}`,
      });
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "text-red-500",
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
    };
    return colorMap[color] || "text-gray-500";
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {gameState === "idle" && (
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            Select the COLOR of the text, not the word itself. This tests your ability to
            inhibit automatic reading responses.
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-lg mb-6">{currentQ.question}</p>
            <Card className="p-12 max-w-md mx-auto">
              <motion.div
                key={currentQ.id}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`text-6xl font-bold ${getColorClass(currentQ.data.inkColor)}`}
              >
                {currentQ.data.word.toUpperCase()}
              </motion.div>
            </Card>
            <p className="text-sm text-muted-foreground mt-6 mb-4">
              What color is the text?
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  onClick={() => handleAnswer(color)}
                  variant="outline"
                  className="capitalize min-w-[100px]"
                >
                  {color}
                </Button>
              ))}
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
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {reactionTime > 0 && currentQ.data.inkColor === questions[currentQuestion]?.data.inkColor ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {reactionTime > 0 && currentQ.data.inkColor === questions[currentQuestion]?.data.inkColor
                    ? "Correct!"
                    : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Correct answer: {currentQ.data.inkColor}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Time: {reactionTime.toFixed(2)}s
                </p>
              </div>
              <Button onClick={nextQuestion} className="glow-primary">
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {questions.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Score: {score}/{questions.length}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGameState("idle");
              setQuestions([]);
              setCurrentQuestion(0);
              setScore(0);
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

