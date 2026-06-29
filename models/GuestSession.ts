import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuestSession extends Document {
  guestId: string;
  recentlyPlayed: string[];
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSessionSchema: Schema<IGuestSession> = new Schema({
  guestId: { type: String, required: true, unique: true },
  recentlyPlayed: { type: [String], default: [] },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const GuestSession: Model<IGuestSession> = mongoose.models.GuestSession || mongoose.model<IGuestSession>('GuestSession', GuestSessionSchema);
export default GuestSession;
