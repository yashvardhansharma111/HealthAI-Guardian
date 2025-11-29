import mongoose from "mongoose";

const visuospatialResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "VisuospatialItem" },
    variantPath: String,
    questionId: Number,
    userAnswer: String, // Can be "same"/"different" for old format or description text
    userDescription: String, // User's description of what they see in the image
    isCorrect: Boolean,
    reactionTime: Number,
    mistakes: [String],
    
    // Embedding for RAG
    embedding: {
      type: [Number],
      default: undefined,
    },

    // Disease mapping (dementia)
    diseaseType: {
      type: String,
      enum: ["dementia", "alzheimers", null],
      default: "dementia",
    },

    timestamp: { type: Date, default: Date.now },
    baseImageUrl: String, // Store the image URL for reference
  },
  { timestamps: true }
);

// Index for vector search
visuospatialResultSchema.index({ embedding: "2dsphere" });
visuospatialResultSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.VisuospatialResult ||
  mongoose.model("VisuospatialResult", visuospatialResultSchema);
