import mongoose from "mongoose";

const healthPredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Input data
    input: {
      // Heart features
      age: Number,
      sex: Number,
      cp: Number,
      trestbps: Number,
      chol: Number,
      fbs: Number,
      restecg: Number,
      thalach: Number,
      exang: Number,
      oldpeak: Number,
      slope: Number,
      ca: Number,
      thal: Number,
      
      // Diabetes features
      Pregnancies: Number,
      Glucose: Number,
      BloodPressure: Number,
      SkinThickness: Number,
      Insulin: Number,
      BMI: Number,
      DiabetesPedigreeFunction: Number,
      Age_diabetes: Number,
      
      // Daily lifestyle
      daily_sleep_hours: Number,
      daily_steps: Number,
      daily_exercise_minutes: Number,
      daily_stress_score: Number,
      water_intake_liters: Number,
      calories_consumed: Number,
    },
    
    // ML output
    ml_output: {
      heart_disease_risk: Number,
      diabetes_risk: Number,
    },
    
    // Grok insights
    grok_insights: String,
    
    // Embedding for RAG
    embedding: {
      type: [Number],
      default: undefined,
    },

    // Disease mapping (diabetes, heart)
    diseaseType: {
      type: [String],
      enum: ["diabetes", "heart", null],
      default: ["diabetes", "heart"],
    },
    
    // Metadata
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for vector search
healthPredictionSchema.index({ embedding: "2dsphere" });
healthPredictionSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.HealthPrediction ||
  mongoose.model("HealthPrediction", healthPredictionSchema);

