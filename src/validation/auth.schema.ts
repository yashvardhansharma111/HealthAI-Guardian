import { z } from "zod";

export const registerSchema = z.preprocess(
  (data: any) => {
    // Convert empty strings to undefined for optional fields
    if (data.age === "" || data.age === null) data.age = undefined;
    if (data.gender === "" || data.gender === null) data.gender = undefined;
    if (data.education === "" || data.education === null) data.education = undefined;
    if (data.occupation === "" || data.occupation === null) data.occupation = undefined;
    return data;
  },
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),

    age: z.number().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),

    education: z.enum(["low", "medium", "high"]).optional(),
    occupation: z
      .enum(["manual", "desk", "unemployed", "retired", "student", "other"])
      .optional(),

  familyHistory: z
    .array(
      z.object({
        disease: z.enum([
          "dementia",
          "alzheimers",
          "parkinsons",
          "stroke",
          "diabetes",
          "hypertension",
          "depression",
          "other",
        ]),
        hasDisease: z.enum(["yes", "no", "unknown"]).optional(),
        relationship: z
          .enum([
            "mother",
            "father",
            "grandparent",
            "sibling",
            "other",
            "unknown",
          ])
          .optional(),
      })
    )
    .optional(),

  lifestyle: z
    .object({
      smoking: z
        .object({
          type: z.string().optional(),
          frequency: z
            .enum(["never", "rarely", "occasionally", "weekly", "daily"])
            .optional(),
        })
        .optional(),

      alcoholUse: z
        .object({
          frequency: z
            .enum(["never", "rarely", "occasionally", "weekly", "daily"])
            .optional(),
        })
        .optional(),

      physicalActivity: z.enum(["low", "moderate", "high"]).optional(),

      sleep: z
        .object({
          durationHours: z.number().optional(),
          quality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
        })
        .optional(),
    })
    .optional(),

  medicalHistory: z
    .object({
      hypertension: z.boolean().optional(),
      diabetes: z.boolean().optional(),
      depression: z.boolean().optional(),
      stroke: z.boolean().optional(),
      headTrauma: z.boolean().optional(),
      otherConditions: z.array(z.string()).optional(),
    })
    .optional(),
  })
);
