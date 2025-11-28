"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/use-toast";
import { Heart, Activity, TrendingUp, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

interface HealthPrediction {
  _id: string;
  input: any;
  ml_output: {
    heart_disease_risk: number;
    diabetes_risk: number;
  };
  grok_insights?: string;
  timestamp: string;
  createdAt: string;
}

export default function HealthPredictionCard() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<HealthPrediction | null>(null);

  const fetchPredictions = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch("/api/health/predictions?limit=1", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPredictions(data.data.predictions || []);
          if (data.data.predictions && data.data.predictions.length > 0) {
            setLatestPrediction(data.data.predictions[0]); // Most recent
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    
    // Listen for refresh events from HealthSimulator
    const handleRefresh = () => {
      fetchPredictions();
    };
    
    window.addEventListener("health-prediction-updated", handleRefresh);
    
    return () => {
      window.removeEventListener("health-prediction-updated", handleRefresh);
    };
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk >= 0.7) return "text-red-500";
    if (risk >= 0.4) return "text-orange-500";
    return "text-green-500";
  };

  const getRiskBgColor = (risk: number) => {
    if (risk >= 0.7) return "bg-red-500/10 border-red-500/20";
    if (risk >= 0.4) return "bg-orange-500/10 border-orange-500/20";
    return "bg-green-500/10 border-green-500/20";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 0.7) return "High Risk";
    if (risk >= 0.4) return "Medium Risk";
    return "Low Risk";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestPrediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Health Predictions
          </CardTitle>
          <CardDescription>
            No health predictions yet. Use the simulator to generate your first prediction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard#health-simulator">
            <Button className="w-full glow-primary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Health Prediction
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const heartRisk = latestPrediction.ml_output?.heart_disease_risk || 0;
  const diabetesRisk = latestPrediction.ml_output?.diabetes_risk || 0;
  const predictionDate = new Date(latestPrediction.timestamp || latestPrediction.createdAt).toLocaleDateString();

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Latest Health Prediction
            </CardTitle>
            <CardDescription>Last updated: {predictionDate}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPredictions}
            className="h-8 w-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Scores */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border ${getRiskBgColor(heartRisk)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${getRiskColor(heartRisk)}`} />
                <span className="font-semibold">Heart Disease Risk</span>
              </div>
              <AlertTriangle
                className={`w-4 h-4 ${getRiskColor(heartRisk)} ${heartRisk >= 0.7 ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getRiskColor(heartRisk)}`}>
                  {(heartRisk * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  ({getRiskLabel(heartRisk)})
                </span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${heartRisk * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    heartRisk >= 0.7
                      ? "bg-red-500"
                      : heartRisk >= 0.4
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg border ${getRiskBgColor(diabetesRisk)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${getRiskColor(diabetesRisk)}`} />
                <span className="font-semibold">Diabetes Risk</span>
              </div>
              <AlertTriangle
                className={`w-4 h-4 ${getRiskColor(diabetesRisk)} ${diabetesRisk >= 0.7 ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getRiskColor(diabetesRisk)}`}>
                  {(diabetesRisk * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  ({getRiskLabel(diabetesRisk)})
                </span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${diabetesRisk * 100}%` }}
                  transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    diabetesRisk >= 0.7
                      ? "bg-red-500"
                      : diabetesRisk >= 0.4
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics Summary */}
        {latestPrediction.input && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Sleep Hours</p>
              <p className="text-sm font-semibold">
                {latestPrediction.input.daily_sleep_hours?.toFixed(1) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Steps</p>
              <p className="text-sm font-semibold">
                {latestPrediction.input.daily_steps?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Exercise (min)</p>
              <p className="text-sm font-semibold">
                {latestPrediction.input.daily_exercise_minutes || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stress Score</p>
              <p className="text-sm font-semibold">
                {latestPrediction.input.daily_stress_score?.toFixed(2) || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* AI Insights Preview */}
        {latestPrediction.grok_insights && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">AI Health Insights</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {latestPrediction.grok_insights.substring(0, 200)}
              {latestPrediction.grok_insights.length > 200 ? "..." : ""}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href="/dashboard#health-simulator" className="flex-1">
            <Button variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              New Prediction
            </Button>
          </Link>
          {predictions.length > 1 && (
            <Button
              variant="ghost"
              onClick={() => {
                // Could navigate to full history page
                toast({
                  title: "History",
                  description: `You have ${predictions.length} predictions in total`,
                });
              }}
            >
              View History
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

