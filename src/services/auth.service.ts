import userRepository from "../repositories/user.repository";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/auth";

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

    age: data.age,
    gender: data.gender,

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

  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
}

async function login(email: string, password: string) {
  const user: any = await userRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({ id: user._id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

export default { register, login };
