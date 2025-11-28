"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import { useAuth } from "@/app/hooks/useAuth";
import { Loader2, CheckCircle2, XCircle, Play, RotateCcw } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  data: { digits: number[] };
  meta: any;
}

export default function DigitSpanGame() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "result">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const startGame = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("/api/games/attention/digitspan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load game");

      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestion(0);
      setGameState("showing");
      setScore(0);
      setUserInput("");
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

  useEffect(() => {
    if (gameState === "showing" && questions.length > 0) {
      const timer = setTimeout(() => {
        setGameState("input");
        setStartTime(Date.now());
      }, 3000); // Show digits for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [gameState, questions]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter the digits",
        variant: "destructive",
      });
      return;
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;

    const userDigits = userInput.split("").map(Number).filter((n) => !isNaN(n));
    const shownDigits = questions[currentQuestion]?.data.digits || [];

    setReactionTime(timeTaken);
    setGameState("result");

    // Save result
    try {
      const token = getToken();
      await fetch("/api/games/attention/digitspan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questions[currentQuestion].id,
          shownDigits,
          userDigits,
          reactionTime: timeTaken,
        }),
      });

      const isCorrect = JSON.stringify(shownDigits) === JSON.stringify(userDigits);
      if (isCorrect) {
        setScore(score + 1);
        toast({
          title: "Correct!",
          description: "Well done!",
        });
      } else {
        toast({
          title: "Incorrect",
          description: "Try again!",
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
      setGameState("showing");
      setUserInput("");
    } else {
      setGameState("idle");
      toast({
        title: "Game Complete!",
        description: `Score: ${score + (gameState === "result" && JSON.stringify(questions[currentQuestion]?.data.digits) === JSON.stringify(userInput.split("").map(Number).filter((n) => !isNaN(n)))) ? 1 : 0}/${questions.length}`,
      });
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {gameState === "idle" && (
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            Memorize the sequence of digits shown and repeat them in the same order.
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

      {gameState === "showing" && currentQ && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-8"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-lg mb-6">{currentQ.question}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {currentQ.data.digits.map((digit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-16 h-16 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-bold"
                >
                  {digit}
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Memorize these digits...
            </p>
          </div>
        </motion.div>
      )}

      {gameState === "input" && currentQ && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-8"
        >
          <div className="text-center">
            <p className="text-lg mb-4">Enter the digits in the same order:</p>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter digits..."
              className="text-center text-2xl font-mono max-w-md mx-auto"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={handleSubmit} className="glow-primary">
              Submit
            </Button>
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
                {JSON.stringify(currentQ.data.digits) ===
                JSON.stringify(userInput.split("").map(Number).filter((n) => !isNaN(n))) ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {JSON.stringify(currentQ.data.digits) ===
                  JSON.stringify(userInput.split("").map(Number).filter((n) => !isNaN(n)))
                    ? "Correct!"
                    : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Correct sequence: {currentQ.data.digits.join("")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your answer: {userInput || "(empty)"}
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

