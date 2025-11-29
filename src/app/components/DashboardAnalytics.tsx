"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Heart,
  AlertTriangle,
  Activity,
  Loader2,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RiskProfile {
  alzheimers: number;
  dementia: number;
  stress: number;
  depression: number;
  diabetes: number;
  heart: number;
}

interface GameSuggestion {
  suggestedGames: string[];
  reasoning: string;
  priority: "high" | "medium" | "low";
}

interface AnalyticsData {
  report: string;
  riskProfile: RiskProfile;
  suggestions: GameSuggestion;
  retrievedDocsCount: number;
}

export default function DashboardAnalytics() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  const fetchAnalytics = async (diseaseType?: string) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const url = new URL("/api/rag/report", window.location.origin);
      if (diseaseType) {
        url.searchParams.set("diseaseType", diseaseType);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/10";
      case "medium":
        return "text-orange-500 bg-orange-500/10";
      default:
        return "text-green-500 bg-green-500/10";
    }
  };

  // Prepare chart data
  const riskChartData = data
    ? [
        {
          name: "Alzheimer's",
          risk: data.riskProfile.alzheimers * 100,
        },
        {
          name: "Dementia",
          risk: data.riskProfile.dementia * 100,
        },
        {
          name: "Stress",
          risk: data.riskProfile.stress * 100,
        },
        {
          name: "Depression",
          risk: data.riskProfile.depression * 100,
        },
        {
          name: "Diabetes",
          risk: data.riskProfile.diabetes * 100,
        },
        {
          name: "Heart",
          risk: data.riskProfile.heart * 100,
        },
      ]
    : [];

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

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No analytics data available</p>
          <Button onClick={() => fetchAnalytics()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Risk Profile Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your health risks based on cognitive performance
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchAnalytics(selectedDisease || undefined)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="risk" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.alzheimers)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Brain className={`w-5 h-5 ${getRiskColor(data.riskProfile.alzheimers)}`} />
                <span className="text-xs text-muted-foreground">Alzheimer's</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.alzheimers * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.alzheimers)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.dementia)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className={`w-5 h-5 ${getRiskColor(data.riskProfile.dementia)}`} />
                <span className="text-xs text-muted-foreground">Dementia</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.dementia * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.dementia)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.stress)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className={`w-5 h-5 ${getRiskColor(data.riskProfile.stress)}`} />
                <span className="text-xs text-muted-foreground">Stress</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.stress * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.stress)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.depression)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Brain className={`w-5 h-5 ${getRiskColor(data.riskProfile.depression)}`} />
                <span className="text-xs text-muted-foreground">Depression</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.depression * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.depression)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.diabetes)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className={`w-5 h-5 ${getRiskColor(data.riskProfile.diabetes)}`} />
                <span className="text-xs text-muted-foreground">Diabetes</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.diabetes * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.diabetes)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`p-4 rounded-lg border ${getRiskBgColor(data.riskProfile.heart)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Heart className={`w-5 h-5 ${getRiskColor(data.riskProfile.heart)}`} />
                <span className="text-xs text-muted-foreground">Heart</span>
              </div>
              <div className="text-2xl font-bold">
                {(data.riskProfile.heart * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRiskLabel(data.riskProfile.heart)}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* AI Health Report */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Health Report</CardTitle>
          <CardDescription>
            Personalized insights based on your cognitive performance and health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground">
              {data.report}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            Suggested games and modules based on your risk profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Priority:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                data.suggestions.priority
              )}`}
            >
              {data.suggestions.priority.toUpperCase()}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Suggested Games:</h4>
            <div className="flex flex-wrap gap-2">
              {data.suggestions.suggestedGames.map((game, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {game.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Reasoning:</h4>
            <p className="text-sm text-muted-foreground">{data.suggestions.reasoning}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

