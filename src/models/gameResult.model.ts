import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    gameType: { type: String, required: true },

    inputData: {},
    userResponse: {},

    accuracy: Number,
    reactionTime: Number,
    errors: [String],

    // Embedding for RAG
    embedding: {
      type: [Number],
      default: undefined,
    },

    // Disease mapping
    diseaseType: {
      type: String,
      enum: ["alzheimers", "dementia", null],
      default: null,
    },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for vector search (if using MongoDB Atlas Vector Search)
gameResultSchema.index({ embedding: "2dsphere" });
gameResultSchema.index({ userId: 1, timestamp: -1 });
gameResultSchema.index({ gameType: 1, timestamp: -1 });

export default mongoose.models.GameResult ||
  mongoose.model("GameResult", gameResultSchema);
