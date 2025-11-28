import { connectDB } from "@/config/db";
import { requireAuth } from "@/middlewares/auth.middleware";
import { success, failure } from "@/utils/apiResponse";
import { NextResponse } from "next/server";
import { profileUpdateSchema } from "@/validation/profile.schema";
import User from "@/models/user.model";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();
    const data = profileUpdateSchema.parse(body);

    // Update user profile
    const user = await User.findByIdAndUpdate(
      authResult.user.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        failure({ message: "User not found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      success(
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            age: user.age,
            gender: user.gender,
            education: user.education,
            occupation: user.occupation,
            familyHistory: user.familyHistory,
            lifestyle: user.lifestyle,
            medicalHistory: user.medicalHistory,
          },
        },
        200
      )
    );
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      failure(err.message || "Failed to update profile"),
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const user = await User.findById(authResult.user.id).select("-password");

    if (!user) {
      return NextResponse.json(
        failure({ message: "User not found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      success(
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            age: user.age,
            gender: user.gender,
            education: user.education,
            occupation: user.occupation,
            familyHistory: user.familyHistory,
            lifestyle: user.lifestyle,
            medicalHistory: user.medicalHistory,
          },
        },
        200
      )
    );
  } catch (err: any) {
    console.error("Profile get error:", err);
    return NextResponse.json(
      failure(err.message || "Failed to get profile"),
      { status: 400 }
    );
  }
}

