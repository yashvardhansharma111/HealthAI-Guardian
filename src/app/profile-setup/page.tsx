"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Shield, Loader2, User, Calendar, Activity, Heart, Pill } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/components/Navbar";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading, getToken, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Basic Info
    age: "",
    gender: "",
    education: "",
    occupation: "",

    // Lifestyle
    smokingFrequency: "never",
    alcoholFrequency: "never",
    physicalActivity: "low",
    sleepDuration: "",
    sleepQuality: "fair",

    // Medical History
    hypertension: false,
    diabetes: false,
    depression: false,
    stroke: false,
    headTrauma: false,
    otherConditions: [] as string[],

    // Family History
    familyHistory: [] as Array<{
      disease: string;
      hasDisease: string;
      relationship: string;
    }>,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const profileData = {
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        education: formData.education || undefined,
        occupation: formData.occupation || undefined,
        lifestyle: {
          smoking: {
            frequency: formData.smokingFrequency,
          },
          alcoholUse: {
            frequency: formData.alcoholFrequency,
          },
          physicalActivity: formData.physicalActivity,
          sleep: {
            durationHours: formData.sleepDuration
              ? parseFloat(formData.sleepDuration)
              : undefined,
            quality: formData.sleepQuality,
          },
        },
        medicalHistory: {
          hypertension: formData.hypertension,
          diabetes: formData.diabetes,
          depression: formData.depression,
          stroke: formData.stroke,
          headTrauma: formData.headTrauma,
          otherConditions: formData.otherConditions,
        },
        familyHistory: formData.familyHistory.length > 0 ? formData.familyHistory : undefined,
      };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh auth state to get updated user profile
        await checkAuth();
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addFamilyHistory = () => {
    setFormData({
      ...formData,
      familyHistory: [
        ...formData.familyHistory,
        { disease: "dementia", hasDisease: "unknown", relationship: "unknown" },
      ],
    });
  };

  const updateFamilyHistory = (index: number, field: string, value: string) => {
    const updated = [...formData.familyHistory];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, familyHistory: updated });
  };

  const removeFamilyHistory = (index: number) => {
    setFormData({
      ...formData,
      familyHistory: formData.familyHistory.filter((_, i) => i !== index),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
              <CardDescription className="text-base">
                Help us personalize your health journey by sharing some information
              </CardDescription>
              <div className="flex gap-2 justify-center mt-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="150"
                          value={formData.age}
                          onChange={(e) =>
                            setFormData({ ...formData, age: e.target.value })
                          }
                          placeholder="25"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education Level</Label>
                      <Select
                        value={formData.education}
                        onValueChange={(value) =>
                          setFormData({ ...formData, education: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">High School or Less</SelectItem>
                          <SelectItem value="medium">Some College</SelectItem>
                          <SelectItem value="high">College Degree or Higher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Select
                        value={formData.occupation}
                        onValueChange={(value) =>
                          setFormData({ ...formData, occupation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Labor</SelectItem>
                          <SelectItem value="desk">Desk Job</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Lifestyle */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Lifestyle</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smoking">Smoking Frequency</Label>
                      <Select
                        value={formData.smokingFrequency}
                        onValueChange={(value) =>
                          setFormData({ ...formData, smokingFrequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alcohol">Alcohol Use Frequency</Label>
                      <Select
                        value={formData.alcoholFrequency}
                        onValueChange={(value) =>
                          setFormData({ ...formData, alcoholFrequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physicalActivity">Physical Activity Level</Label>
                      <Select
                        value={formData.physicalActivity}
                        onValueChange={(value) =>
                          setFormData({ ...formData, physicalActivity: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sleepDuration">Sleep Duration (hours)</Label>
                        <Input
                          id="sleepDuration"
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={formData.sleepDuration}
                          onChange={(e) =>
                            setFormData({ ...formData, sleepDuration: e.target.value })
                          }
                          placeholder="7.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sleepQuality">Sleep Quality</Label>
                        <Select
                          value={formData.sleepQuality}
                          onValueChange={(value) =>
                            setFormData({ ...formData, sleepQuality: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="excellent">Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Medical History */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Pill className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Medical History</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hypertension"
                          checked={formData.hypertension}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hypertension: !!checked })
                          }
                        />
                        <Label htmlFor="hypertension" className="cursor-pointer">
                          Hypertension
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="diabetes"
                          checked={formData.diabetes}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, diabetes: !!checked })
                          }
                        />
                        <Label htmlFor="diabetes" className="cursor-pointer">
                          Diabetes
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="depression"
                          checked={formData.depression}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, depression: !!checked })
                          }
                        />
                        <Label htmlFor="depression" className="cursor-pointer">
                          Depression
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="stroke"
                          checked={formData.stroke}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, stroke: !!checked })
                          }
                        />
                        <Label htmlFor="stroke" className="cursor-pointer">
                          Stroke
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="headTrauma"
                          checked={formData.headTrauma}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, headTrauma: !!checked })
                          }
                        />
                        <Label htmlFor="headTrauma" className="cursor-pointer">
                          Head Trauma
                        </Label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Family History */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Family History (Optional)</h3>
                    </div>

                    {formData.familyHistory.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Disease</Label>
                            <Select
                              value={item.disease}
                              onValueChange={(value) =>
                                updateFamilyHistory(index, "disease", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dementia">Dementia</SelectItem>
                                <SelectItem value="alzheimers">Alzheimer's</SelectItem>
                                <SelectItem value="parkinsons">Parkinson's</SelectItem>
                                <SelectItem value="stroke">Stroke</SelectItem>
                                <SelectItem value="diabetes">Diabetes</SelectItem>
                                <SelectItem value="hypertension">Hypertension</SelectItem>
                                <SelectItem value="depression">Depression</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Has Disease</Label>
                            <Select
                              value={item.hasDisease}
                              onValueChange={(value) =>
                                updateFamilyHistory(index, "hasDisease", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Select
                              value={item.relationship}
                              onValueChange={(value) =>
                                updateFamilyHistory(index, "relationship", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="grandparent">Grandparent</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFamilyHistory(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFamilyHistory}
                      className="w-full"
                    >
                      Add Family History Entry
                    </Button>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="glow-primary">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

