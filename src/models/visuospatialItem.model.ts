import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  transform: {
    rotate: { type: Number, default: 0 },
    mirror: { type: Boolean, default: false },
    highlightRemovedArea: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  isSame: { type: Boolean, required: true },
});

const visuospatialItemSchema = new mongoose.Schema(
  {
    title: String,
    baseImageUrl: { type: String, required: true },
    variants: [variantSchema],
  },
  { timestamps: true }
);

export default mongoose.models.VisuospatialItem ||
  mongoose.model("VisuospatialItem", visuospatialItemSchema);
