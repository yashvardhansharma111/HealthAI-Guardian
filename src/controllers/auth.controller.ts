import authService from "../services/auth.service";
import { success, failure } from "../utils/apiResponse";
import { registerSchema } from "../validation/auth.schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

async function register(body: any) {
  try {
    const data = registerSchema.parse(body);
    const result = await authService.register(data);
    return success(result, 201);
  } catch (err) {
    return failure(err);
  }
}

async function login(body: any) {
  try {
    const data = loginSchema.parse(body);
    const response = await authService.login(data.email, data.password);
    return success(response, 200);
  } catch (err: any) {
    return failure(err);
  }
}

export default { register, login };
