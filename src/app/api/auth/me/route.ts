import { connectDB } from "@/config/db";
import { requireAuth } from "@/middlewares/auth.middleware";
import { success, failure } from "@/utils/apiResponse";
import { NextResponse } from "next/server";
import User from "@/models/user.model";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    // Fetch full user profile from database
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
            id: user._id?.toString() || user.id?.toString(),
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
  } catch (err) {
    return NextResponse.json(failure(err), { status: 401 });
  }
}

