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

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.GameResult ||
  mongoose.model("GameResult", gameResultSchema);
