import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayEvent extends Document {
  gameSlug: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  createdAt: Date;
}

const PlayEventSchema: Schema<IPlayEvent> = new Schema({
  gameSlug: { type: String, required: true },
  deviceType: { type: String, enum: ["mobile", "desktop", "tablet", "unknown"], default: "unknown" },
  createdAt: { type: Date, default: Date.now },
});

// Index to optimize querying plays by gameSlug and date range
PlayEventSchema.index({ gameSlug: 1, createdAt: -1 });
PlayEventSchema.index({ createdAt: -1 });

const PlayEvent: Model<IPlayEvent> = mongoose.models.PlayEvent || mongoose.model<IPlayEvent>('PlayEvent', PlayEventSchema);
export default PlayEvent;
