import { z } from "zod";

export const profileUpdateSchema = z.object({
  age: z.number().min(1).max(150).optional(),
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
          durationHours: z.number().min(0).max(24).optional(),
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
});

