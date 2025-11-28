import userRepository from "../repositories/user.repository";
import {
  hashPassword,
  comparePassword,
} from "../utils/auth";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { createAccessToken } from "@/utils/auth";

async function register(data: any) {
  // CHECK IF USER EXISTS
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) throw new Error("User already exists");

  // HASH PASSWORD
  const hashedPassword = await hashPassword(data.password);

  // BUILD COMPLETE USER OBJECT
  const newUserObj = {
    name: data.name,
    email: data.email,
    password: hashedPassword,

    age: data.age || undefined,
    gender: data.gender || undefined,

    education: data.education,
    occupation: data.occupation,

    familyHistory: data.familyHistory || [],

    lifestyle: {
      smoking: data?.lifestyle?.smoking ?? {
        type: "never",
        frequency: "never",
      },
      alcoholUse: data?.lifestyle?.alcoholUse ?? { frequency: "never" },
      physicalActivity: data?.lifestyle?.physicalActivity ?? "low",
      sleep: data?.lifestyle?.sleep ?? { durationHours: null, quality: "fair" },
    },

    medicalHistory: {
      hypertension: data?.medicalHistory?.hypertension ?? false,
      diabetes: data?.medicalHistory?.diabetes ?? false,
      depression: data?.medicalHistory?.depression ?? false,
      stroke: data?.medicalHistory?.stroke ?? false,
      headTrauma: data?.medicalHistory?.headTrauma ?? false,
      otherConditions: data?.medicalHistory?.otherConditions ?? [],
    },
  };

  // SAVE USER
  const user = await userRepository.createUser(newUserObj);
  const token = createAccessToken(user._id);

  return {
    user: { id: user._id, email: user.email, name: user.name },
    token,
  };
}

async function login(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const userId = user._id?.toString() || user.id?.toString();
  if (!userId) throw new Error("User ID not found");

  const token = createAccessToken(userId);

  return {
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
    },
    token,
  };
}

export default { register, login };
