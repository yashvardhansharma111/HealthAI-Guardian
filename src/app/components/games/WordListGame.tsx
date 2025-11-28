"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import { useAuth } from "@/app/hooks/useAuth";
import { Loader2, Play, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  data: { words: string[] };
  meta: {
    delaySeconds: number;
    scheduledAt: string;
  };
}

export default function WordListGame() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "showing" | "waiting" | "recall" | "result">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const startGame = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("/api/games/memory/wordlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load game");

      const data = await response.json();
      console.log("WordList API response:", data); // Debug log
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid game data received");
      }
      
      // Validate question structure
      const validQuestions = data.questions.filter((q: any) => 
        q && q.data && Array.isArray(q.data.words) && q.data.words.length > 0
      );
      
      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in game data");
      }
      
      setQuestions(validQuestions);
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
      const currentQ = questions[currentQuestion];
      if (currentQ && currentQ.data?.words) {
        const timer = setTimeout(() => {
          setGameState("waiting");
          setTimeRemaining(currentQ.meta?.delaySeconds || 60);
          setStartTime(Date.now());
        }, 5000); // Show words for 5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, questions, currentQuestion]);

  useEffect(() => {
    if (gameState === "waiting" && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "waiting" && timeRemaining === 0) {
      setGameState("recall");
    }
  }, [gameState, timeRemaining]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter the words you remember",
        variant: "destructive",
      });
      return;
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;

    const recalledWords = userInput
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);
    const shownWords = (questions[currentQuestion]?.data?.words || []).map((w: string) => w.toLowerCase());

    setReactionTime(timeTaken);
    setGameState("result");

    // Calculate accuracy
    const correct = recalledWords.filter((w) => shownWords.includes(w)).length;
    const accuracy = correct / shownWords.length;

    // Save result
    try {
      const token = getToken();
      await fetch("/api/games/memory/wordlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: questions[currentQuestion].id,
          shownWords: questions[currentQuestion].data.words,
          recalledWords: userInput.split(",").map((w) => w.trim()).filter((w) => w.length > 0),
          reactionTime: timeTaken,
        }),
      });

      if (accuracy >= 0.8) {
        setScore(score + 1);
        toast({
          title: "Great recall!",
          description: `${correct}/${shownWords.length} words correct`,
        });
      } else {
        toast({
          title: "Results",
          description: `You recalled ${correct}/${shownWords.length} words`,
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
        description: `Score: ${score}/${questions.length}`,
      });
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {gameState === "idle" && (
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            Memorize the words shown. After a delay, you'll be asked to recall as many as you can.
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

      {gameState === "showing" && currentQ && currentQ.data?.words && (
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
            <Card className="p-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentQ.data.words.map((word, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center font-semibold"
                  >
                    {word}
                  </motion.div>
                ))}
              </div>
            </Card>
            <p className="text-sm text-muted-foreground mt-4">
              Memorize these words. You'll be asked to recall them after {currentQ.meta?.delaySeconds || 60} seconds.
            </p>
          </div>
        </motion.div>
      )}

      {gameState === "waiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6 py-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary">
            <Clock className="w-6 h-6 animate-pulse" />
            <p className="text-2xl font-bold">{timeRemaining}</p>
          </div>
          <p className="text-lg">Wait before recalling...</p>
        </motion.div>
      )}

      {gameState === "recall" && currentQ && currentQ.data?.words && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-8"
        >
          <div className="text-center">
            <p className="text-lg mb-4">Recall the words you saw (separate with commas):</p>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="word1, word2, word3..."
              className="text-center text-lg max-w-md mx-auto"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="flex justify-center">
            <Button onClick={handleSubmit} className="glow-primary">
              Submit
            </Button>
          </div>
        </motion.div>
      )}

      {gameState === "result" && currentQ && currentQ.data?.words && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 py-8"
        >
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-lg font-semibold mb-2">Results</p>
                <p className="text-sm text-muted-foreground">
                  You recalled: {userInput.split(",").map((w) => w.trim()).filter((w) => w.length > 0).length} words
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Original words: {(currentQ.data.words || []).join(", ")}
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

