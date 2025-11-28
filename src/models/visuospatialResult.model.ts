import mongoose from "mongoose";

const visuospatialResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "VisuospatialItem" },
    variantPath: String,
    questionId: Number,
    userAnswer: { type: String, enum: ["same", "different", "unsure"] },
    isCorrect: Boolean,
    reactionTime: Number,
    mistakes: [String],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.VisuospatialResult ||
  mongoose.model("VisuospatialResult", visuospatialResultSchema);
