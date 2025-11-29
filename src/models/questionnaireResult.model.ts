import mongoose from "mongoose";

const questionnaireResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true },
    
    questionId: { type: Number, required: true },
    questionText: { type: String, required: true },
    answer: { type: String, required: true },
    
    // Video analysis from FastAPI
    videoAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    
    // Keystroke analysis from FastAPI
    keystrokeAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    
    // Embedding for RAG
    embedding: {
      type: [Number],
      default: undefined,
    },

    // Disease mapping (stress, depression)
    diseaseType: {
      type: [String],
      enum: ["stress", "depression", null],
      default: ["stress", "depression"],
    },
    
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for vector search
questionnaireResultSchema.index({ embedding: "2dsphere" });
questionnaireResultSchema.index({ userId: 1, timestamp: -1 });
questionnaireResultSchema.index({ sessionId: 1 });

export default mongoose.models.QuestionnaireResult ||
  mongoose.model("QuestionnaireResult", questionnaireResultSchema);

