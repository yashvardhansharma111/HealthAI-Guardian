import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ========================
    // Basic Profile
    // ========================
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // ========================
    // Personal Information
    // ========================
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    education: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    occupation: {
      type: String,
      enum: ["manual", "desk", "unemployed", "retired", "student", "other"],
      default: "other",
    },

    // ========================
    // Family History
    // ========================
    familyHistory: [
      {
        disease: {
          type: String,
          enum: [
            "dementia",
            "alzheimers",
            "parkinsons",
            "stroke",
            "diabetes",
            "hypertension",
            "depression",
            "other",
          ],
          required: true,
        },
        hasDisease: {
          type: String,
          enum: ["yes", "no", "unknown"],
          default: "unknown",
        },
        relationship: {
          type: String,
          enum: [
            "mother",
            "father",
            "grandparent",
            "sibling",
            "other",
            "unknown",
          ],
          default: "unknown",
        },
      },
    ],

    // ========================
    // Lifestyle Factors
    // ========================
    lifestyle: {
      smoking: {
        type: String,
        default: "never",
        frequency: {
          type: String,
          enum: ["never", "rarely", "occasionally", "weekly", "daily"],
          default: "never",
        },
      },
      alcoholUse: {
        frequency: {
          type: String,
          enum: ["never", "rarely", "occasionally", "weekly", "daily"],
          default: "never",
        },
      },
      physicalActivity: {
        type: String,
        enum: ["low", "moderate", "high"],
        default: "low",
      },
      sleep: {
        durationHours: { type: Number, default: null },
        quality: {
          type: String,
          enum: ["poor", "fair", "good", "excellent"],
          default: "fair",
        },
      },
    },

    // ========================
    // Pre-existing Conditions
    // ========================
    medicalHistory: {
      hypertension: { type: Boolean, default: false },
      diabetes: { type: Boolean, default: false },
      depression: { type: Boolean, default: false },
      stroke: { type: Boolean, default: false },
      headTrauma: { type: Boolean, default: false },
      otherConditions: [{ type: String }], // flexible
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
