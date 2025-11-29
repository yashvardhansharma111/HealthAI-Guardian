import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { connectDB } from "@/config/db";
import HealthPrediction from "@/models/healthPrediction.model";
import { success, failure } from "@/utils/apiResponse";
import { generateHealthEmbedding } from "@/services/embeddings.service";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();
    const inputData = body.input || body;

    // Validate required fields
    const requiredFields = [
      "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach",
      "exang", "oldpeak", "slope", "ca", "thal",
      "Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin",
      "BMI", "DiabetesPedigreeFunction", "Age_diabetes"
    ];

    const missingFields = requiredFields.filter(field => !(field in inputData));
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Call FastAPI health prediction endpoint
    const response = await fetch(`${FASTAPI_URL}/predict-health`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: inputData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || "Health prediction failed",
        },
        { status: response.status }
      );
    }

      const data = await response.json();

      if (data.ok && data.ml_output) {
        // Save to database with embedding
        try {
          const predictionData = {
            userId: authResult.user.id,
            input: data.input,
            ml_output: data.ml_output,
            grok_insights: data.grok_insights || "",
            timestamp: new Date(),
          };

          // Generate embedding
          const embedding = await generateHealthEmbedding(predictionData);

          await HealthPrediction.create({
            ...predictionData,
            embedding,
            diseaseType: ["diabetes", "heart"],
          });
        } catch (dbError: any) {
          console.error("Failed to save health prediction:", dbError);
          // Continue even if DB save fails
        }
      }

      return NextResponse.json({
        success: true,
        data: data,
      });
  } catch (error: any) {
    console.error("Health prediction error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to predict health",
      },
      { status: 500 }
    );
  }
}

