"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/app/hooks/use-toast";
import { Loader2, Camera, Video, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { KeystrokeTracker, KeystrokeFeatures } from "@/utils/keystrokeTracker";

const QUESTIONS = [
  "How would you describe your overall stress level in the past week?",
  "What physical symptoms have you experienced recently (e.g., headaches, fatigue, sleep issues)?",
  "How has your mood been affecting your daily activities?",
  "What coping strategies do you use when feeling overwhelmed?",
  "How would you rate your current work-life balance?",
];

export default function QuestionnairePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, getToken } = useAuth();
  const { toast } = useToast();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const keystrokeTrackerRef = useRef<KeystrokeTracker | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && !sessionId) {
      startSession();
    }
  }, [isAuthenticated, sessionId]);

  useEffect(() => {
    // Initialize keystroke tracker
    keystrokeTrackerRef.current = new KeystrokeTracker();
    
    return () => {
      stopRecording();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset timer when question changes
    setTimeRemaining(30);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [currentQuestion]);

  const startSession = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/questionnaire/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data?.session_id) {
        setSessionId(data.data.session_id);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to start session",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      });

      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      recordingStartTimeRef.current = Date.now();
      mediaRecorder.start();
      setIsRecording(true);
      setTimeRemaining(30);

      // Start keystroke tracking
      if (keystrokeTrackerRef.current) {
        keystrokeTrackerRef.current.start();
      }

      // Start countdown timer
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-submit when timer reaches 0
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            // Auto-submit after a brief delay to ensure recording is saved
            setTimeout(() => {
              submitQuestion();
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to access camera: " + error.message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }

    if (keystrokeTrackerRef.current) {
      keystrokeTrackerRef.current.stop();
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (keystrokeTrackerRef.current && isRecording) {
      keystrokeTrackerRef.current.recordKeyDown(e.key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (keystrokeTrackerRef.current && isRecording) {
      keystrokeTrackerRef.current.recordKeyUp(e.key);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const submitQuestion = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session not started",
        variant: "destructive",
      });
      return;
    }

    if (!isRecording) {
      toast({
        title: "Error",
        description: "Please start recording before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    stopRecording();

    try {
      // Wait for recording to finish
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get video blob
      const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      
      // Get keystroke features
      const keystrokeFeatures: KeystrokeFeatures = keystrokeTrackerRef.current
        ? keystrokeTrackerRef.current.getFeatures()
        : ({} as KeystrokeFeatures);

      // Create form data
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("question_id", String(currentQuestion + 1));
      formData.append("question_text", QUESTIONS[currentQuestion]);
      formData.append("video", videoBlob, "question_video.webm");
      formData.append("keystroke_features", JSON.stringify(keystrokeFeatures));
      formData.append("window_start_ts", String(recordingStartTimeRef.current));
      formData.append("window_end_ts", String(Date.now()));
      formData.append("sample_every_s", "2.0");
      formData.append("conf", "0.25");
      formData.append("maxFaces", "1");
      formData.append("return_boxes", "0");
      formData.append("smooth_k", "1");
      formData.append("topk", "3");
      formData.append("min_face_size", "20");

      const token = getToken();
      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Also save to MongoDB with embedding
        try {
          const saveResponse = await fetch("/api/questionnaire/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionId,
              questionId: currentQuestion + 1,
              questionText: QUESTIONS[currentQuestion],
              answer: answers[currentQuestion],
              videoAnalysis: data.data?.video_analysis,
              keystrokeAnalysis: data.data?.keystroke_analysis,
            }),
          });

          if (!saveResponse.ok) {
            console.error("Failed to save questionnaire to MongoDB");
          }
        } catch (saveError) {
          console.error("Error saving questionnaire:", saveError);
        }

        toast({
          title: "Success",
          description: "Question submitted successfully",
        });

        // Move to next question or complete
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          // Reset for next question
          recordedChunksRef.current = [];
          if (keystrokeTrackerRef.current) {
            keystrokeTrackerRef.current.reset();
          }
        } else {
          setCompleted(true);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit question",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit question",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      recordedChunksRef.current = [];
      if (keystrokeTrackerRef.current) {
        keystrokeTrackerRef.current.reset();
      }
      // Reset answer for next question
      const newAnswers = [...answers];
      newAnswers[currentQuestion + 1] = answers[currentQuestion + 1] || "";
      setAnswers(newAnswers);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Questionnaire Completed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for completing the questionnaire. Your responses have been analyzed.
              </p>
              <Button onClick={() => router.push("/dashboard")} className="glow-primary">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                className="h-2 rounded-full bg-primary"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Health Questionnaire</CardTitle>
              <CardDescription>
                Please answer the question below. Your camera will record your facial expressions,
                and we'll analyze your typing patterns for stress detection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  {QUESTIONS[currentQuestion]}
                </Label>
              </div>

              {/* Video Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Video Recording</Label>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-primary">
                        {timeRemaining}s
                      </div>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: "100%" }}
                          animate={{ width: `${(timeRemaining / 30) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                          className="h-2 rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {!isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click "Start Recording" to begin (30 seconds per question)
                        </p>
                      </div>
                    </div>
                  )}
                  {isRecording && (
                    <>
                      <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Recording
                      </div>
                      {timeRemaining <= 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-4xl font-bold text-red-500"
                          >
                            {timeRemaining}
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Answer Textarea */}
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  placeholder="Type your answer here..."
                  className="min-h-[150px]"
                  disabled={!isRecording || isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  {isRecording
                    ? `Recording in progress. ${timeRemaining} seconds remaining. Please type your answer.`
                    : "Please start recording before typing your answer. You have 30 seconds per question."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="glow-primary flex-1"
                    disabled={isProcessing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Stop Recording
                    </Button>
                    <Button
                      onClick={submitQuestion}
                      className="glow-primary flex-1"
                      disabled={isProcessing || !answers[currentQuestion].trim()}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : currentQuestion === QUESTIONS.length - 1 ? (
                        "Submit & Complete"
                      ) : (
                        "Submit & Next"
                      )}
                    </Button>
                  </>
                )}
              </div>

              {currentQuestion > 0 && !isRecording && (
                <Button
                  onClick={handleNext}
                  variant="ghost"
                  className="w-full"
                  disabled={isProcessing}
                >
                  Skip to Next Question
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

