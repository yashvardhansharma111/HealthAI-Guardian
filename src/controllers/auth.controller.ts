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
          tokenSet: true,
        },
        200
      )
    );

    // Set HttpOnly cookie
    res.cookies.set("token", response.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    return NextResponse.json(failure(err), { status: 400 });
  }
}

async function register(body: any) {
  try {
    const data = registerSchema.parse(body);
    const result = await authService.register(data);
    return NextResponse.json(success(result, 201));
  } catch (err) {
    return NextResponse.json(failure(err), { status: 400 });
  }
}

export default { login, register };
