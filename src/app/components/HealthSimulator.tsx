"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/use-toast";
import { Loader2, Heart, Activity, TrendingUp, AlertTriangle } from "lucide-react";

interface HealthInput {
  // Heart features
  age: number;
  sex: number; // 0 = female, 1 = male
  cp: number; // chest pain type (0-3)
  trestbps: number; // resting blood pressure
  chol: number; // serum cholesterol
  fbs: number; // fasting blood sugar > 120 (0 or 1)
  restecg: number; // resting ECG results (0-2)
  thalach: number; // maximum heart rate achieved
  exang: number; // exercise induced angina (0 or 1)
  oldpeak: number; // ST depression induced by exercise
  slope: number; // slope of peak exercise ST segment (0-2)
  ca: number; // number of major vessels (0-3)
  thal: number; // thalassemia (1-3)

  // Diabetes features
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age_diabetes: number;

  // Daily lifestyle metrics
  daily_sleep_hours: number;
  daily_steps: number;
  daily_exercise_minutes: number;
  daily_stress_score: number; // 0-1
  water_intake_liters: number;
  calories_consumed: number;
}

export default function HealthSimulator() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState<HealthInput>({
    // Heart features
    age: 45,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 220,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 1.2,
    slope: 2,
    ca: 0,
    thal: 2,

    // Diabetes features
    Pregnancies: 0,
    Glucose: 110,
    BloodPressure: 72,
    SkinThickness: 20,
    Insulin: 80,
    BMI: 26.5,
    DiabetesPedigreeFunction: 0.45,
    Age_diabetes: 45,

    // Daily lifestyle
    daily_sleep_hours: 6.5,
    daily_steps: 4300,
    daily_exercise_minutes: 25,
    daily_stress_score: 0.62,
    water_intake_liters: 1.8,
    calories_consumed: 2200,
  });

  const generateRandom = () => {
    setFormData({
      // Heart features - realistic ranges
      age: Math.floor(Math.random() * 50) + 30,
      sex: Math.random() > 0.5 ? 1 : 0,
      cp: Math.floor(Math.random() * 4),
      trestbps: Math.floor(Math.random() * 60) + 100,
      chol: Math.floor(Math.random() * 150) + 150,
      fbs: Math.random() > 0.8 ? 1 : 0,
      restecg: Math.floor(Math.random() * 3),
      thalach: Math.floor(Math.random() * 80) + 120,
      exang: Math.random() > 0.7 ? 1 : 0,
      oldpeak: Math.round((Math.random() * 4) * 10) / 10,
      slope: Math.floor(Math.random() * 3),
      ca: Math.floor(Math.random() * 4),
      thal: Math.floor(Math.random() * 3) + 1,

      // Diabetes features
      Pregnancies: Math.floor(Math.random() * 5),
      Glucose: Math.floor(Math.random() * 100) + 70,
      BloodPressure: Math.floor(Math.random() * 40) + 60,
      SkinThickness: Math.floor(Math.random() * 30) + 10,
      Insulin: Math.floor(Math.random() * 200) + 50,
      BMI: Math.round((Math.random() * 15 + 20) * 10) / 10,
      DiabetesPedigreeFunction: Math.round((Math.random() * 1.5) * 100) / 100,
      Age_diabetes: Math.floor(Math.random() * 50) + 30,

      // Daily lifestyle - realistic ranges
      daily_sleep_hours: Math.round((Math.random() * 4 + 5) * 10) / 10,
      daily_steps: Math.floor(Math.random() * 5000) + 2000,
      daily_exercise_minutes: Math.floor(Math.random() * 60) + 10,
      daily_stress_score: Math.round((Math.random()) * 100) / 100,
      water_intake_liters: Math.round((Math.random() * 2 + 1) * 10) / 10,
      calories_consumed: Math.floor(Math.random() * 1000) + 1500,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = getToken();
      const response = await fetch("/api/health/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ input: formData }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
        toast({
          title: "Prediction Complete",
          description: "Health analysis generated successfully",
        });
        // Trigger refresh of HealthPredictionCard
        window.dispatchEvent(new CustomEvent("health-prediction-updated"));
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate prediction",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof HealthInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
    }));
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.7) return "text-red-500";
    if (risk >= 0.4) return "text-orange-500";
    return "text-green-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 0.7) return "High";
    if (risk >= 0.4) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Health Data Simulator
          </CardTitle>
          <CardDescription>
            Enter your health metrics or generate random data to predict heart disease and diabetes risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Heart Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Heart Disease Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex (0=F, 1=M)</Label>
                  <Input
                    id="sex"
                    type="number"
                    min="0"
                    max="1"
                    value={formData.sex}
                    onChange={(e) => handleChange("sex", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp">Chest Pain Type (0-3)</Label>
                  <Input
                    id="cp"
                    type="number"
                    min="0"
                    max="3"
                    value={formData.cp}
                    onChange={(e) => handleChange("cp", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trestbps">Blood Pressure</Label>
                  <Input
                    id="trestbps"
                    type="number"
                    value={formData.trestbps}
                    onChange={(e) => handleChange("trestbps", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chol">Cholesterol</Label>
                  <Input
                    id="chol"
                    type="number"
                    value={formData.chol}
                    onChange={(e) => handleChange("chol", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fbs">Fasting Blood Sugar (0/1)</Label>
                  <Input
                    id="fbs"
                    type="number"
                    min="0"
                    max="1"
                    value={formData.fbs}
                    onChange={(e) => handleChange("fbs", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restecg">Resting ECG (0-2)</Label>
                  <Input
                    id="restecg"
                    type="number"
                    min="0"
                    max="2"
                    value={formData.restecg}
                    onChange={(e) => handleChange("restecg", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thalach">Max Heart Rate</Label>
                  <Input
                    id="thalach"
                    type="number"
                    value={formData.thalach}
                    onChange={(e) => handleChange("thalach", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exang">Exercise Angina (0/1)</Label>
                  <Input
                    id="exang"
                    type="number"
                    min="0"
                    max="1"
                    value={formData.exang}
                    onChange={(e) => handleChange("exang", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldpeak">ST Depression</Label>
                  <Input
                    id="oldpeak"
                    type="number"
                    step="0.1"
                    value={formData.oldpeak}
                    onChange={(e) => handleChange("oldpeak", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slope">Slope (0-2)</Label>
                  <Input
                    id="slope"
                    type="number"
                    min="0"
                    max="2"
                    value={formData.slope}
                    onChange={(e) => handleChange("slope", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ca">Major Vessels (0-3)</Label>
                  <Input
                    id="ca"
                    type="number"
                    min="0"
                    max="3"
                    value={formData.ca}
                    onChange={(e) => handleChange("ca", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thal">Thalassemia (1-3)</Label>
                  <Input
                    id="thal"
                    type="number"
                    min="1"
                    max="3"
                    value={formData.thal}
                    onChange={(e) => handleChange("thal", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Diabetes Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diabetes Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Pregnancies">Pregnancies</Label>
                  <Input
                    id="Pregnancies"
                    type="number"
                    value={formData.Pregnancies}
                    onChange={(e) => handleChange("Pregnancies", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Glucose">Glucose</Label>
                  <Input
                    id="Glucose"
                    type="number"
                    value={formData.Glucose}
                    onChange={(e) => handleChange("Glucose", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="BloodPressure">Blood Pressure</Label>
                  <Input
                    id="BloodPressure"
                    type="number"
                    value={formData.BloodPressure}
                    onChange={(e) => handleChange("BloodPressure", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SkinThickness">Skin Thickness</Label>
                  <Input
                    id="SkinThickness"
                    type="number"
                    value={formData.SkinThickness}
                    onChange={(e) => handleChange("SkinThickness", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Insulin">Insulin</Label>
                  <Input
                    id="Insulin"
                    type="number"
                    value={formData.Insulin}
                    onChange={(e) => handleChange("Insulin", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="BMI">BMI</Label>
                  <Input
                    id="BMI"
                    type="number"
                    step="0.1"
                    value={formData.BMI}
                    onChange={(e) => handleChange("BMI", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="DiabetesPedigreeFunction">Diabetes Pedigree</Label>
                  <Input
                    id="DiabetesPedigreeFunction"
                    type="number"
                    step="0.01"
                    value={formData.DiabetesPedigreeFunction}
                    onChange={(e) => handleChange("DiabetesPedigreeFunction", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Age_diabetes">Age (Diabetes)</Label>
                  <Input
                    id="Age_diabetes"
                    type="number"
                    value={formData.Age_diabetes}
                    onChange={(e) => handleChange("Age_diabetes", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Daily Lifestyle */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Daily Lifestyle Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_sleep_hours">Sleep Hours</Label>
                  <Input
                    id="daily_sleep_hours"
                    type="number"
                    step="0.1"
                    value={formData.daily_sleep_hours}
                    onChange={(e) => handleChange("daily_sleep_hours", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_steps">Daily Steps</Label>
                  <Input
                    id="daily_steps"
                    type="number"
                    value={formData.daily_steps}
                    onChange={(e) => handleChange("daily_steps", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_exercise_minutes">Exercise (min)</Label>
                  <Input
                    id="daily_exercise_minutes"
                    type="number"
                    value={formData.daily_exercise_minutes}
                    onChange={(e) => handleChange("daily_exercise_minutes", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_stress_score">Stress Score (0-1)</Label>
                  <Input
                    id="daily_stress_score"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.daily_stress_score}
                    onChange={(e) => handleChange("daily_stress_score", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water_intake_liters">Water (Liters)</Label>
                  <Input
                    id="water_intake_liters"
                    type="number"
                    step="0.1"
                    value={formData.water_intake_liters}
                    onChange={(e) => handleChange("water_intake_liters", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories_consumed">Calories</Label>
                  <Input
                    id="calories_consumed"
                    type="number"
                    value={formData.calories_consumed}
                    onChange={(e) => handleChange("calories_consumed", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="glow-primary flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Predict Health Risks
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={generateRandom}>
                Generate Random Data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ML Output */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Heart Disease Risk</span>
                      <AlertTriangle
                        className={`w-5 h-5 ${getRiskColor(result.ml_output?.heart_disease_risk || 0)}`}
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${getRiskColor(result.ml_output?.heart_disease_risk || 0)}`}>
                        {(result.ml_output?.heart_disease_risk || 0).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({getRiskLabel(result.ml_output?.heart_disease_risk || 0)})
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (result.ml_output?.heart_disease_risk || 0) >= 0.7
                            ? "bg-red-500"
                            : (result.ml_output?.heart_disease_risk || 0) >= 0.4
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${((result.ml_output?.heart_disease_risk || 0) * 100).toFixed(0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Diabetes Risk</span>
                      <AlertTriangle
                        className={`w-5 h-5 ${getRiskColor(result.ml_output?.diabetes_risk || 0)}`}
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${getRiskColor(result.ml_output?.diabetes_risk || 0)}`}>
                        {(result.ml_output?.diabetes_risk || 0).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({getRiskLabel(result.ml_output?.diabetes_risk || 0)})
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (result.ml_output?.diabetes_risk || 0) >= 0.7
                            ? "bg-red-500"
                            : (result.ml_output?.diabetes_risk || 0) >= 0.4
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${((result.ml_output?.diabetes_risk || 0) * 100).toFixed(0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Grok Insights */}
              {result.grok_insights && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">AI Health Insights</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {result.grok_insights}
                    </p>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

