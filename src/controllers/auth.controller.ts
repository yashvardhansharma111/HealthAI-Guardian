import authService from "../services/auth.service";
import { success, failure } from "../utils/apiResponse";
import { z } from "zod";
import { NextResponse } from "next/server";
import { registerSchema } from "../validation/auth.schema";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

async function login(body: any) {
  try {
    const data = loginSchema.parse(body);

    const response = await authService.login(data.email, data.password);

    const res = NextResponse.json(
      success(
        {
          user: response.user,
          token: response.token,
          tokenSet: true,
        },
        200
      )
    );

    // Set HttpOnly cookie (for server-side requests)
    res.cookies.set("token", response.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    // Handle Zod validation errors
    if (err.name === "ZodError") {
      const errorMessages = err.errors.map((e: any) => {
        const field = e.path.join(".");
        return `${field}: ${e.message}`;
      });
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Login failed",
      },
      { status: 400 }
    );
  }
}

async function register(body: any) {
  try {
    const data = registerSchema.parse(body);
    const result = await authService.register(data);
    
    const res = NextResponse.json(success(result, 201));

    // Set HttpOnly cookie (for server-side requests)
    res.cookies.set("token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    // Handle Zod validation errors
    if (err.name === "ZodError") {
      const errorMessages = err.errors.map((e: any) => {
        const field = e.path.join(".");
        return `${field}: ${e.message}`;
      });
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Registration failed",
      },
      { status: 400 }
    );
  }
}

export default { login, register };
