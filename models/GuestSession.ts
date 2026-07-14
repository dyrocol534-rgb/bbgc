import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuestSession extends Document {
  guestId: string;
  recentlyPlayed: string[];
  lastActiveAt: Date;
  playtimeSeconds: number;
  gamesPlayedCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastIp?: string;
}

const GuestSessionSchema: Schema<IGuestSession> = new Schema({
  guestId: { type: String, required: true, unique: true },
  recentlyPlayed: { type: [String], default: [] },
  lastActiveAt: { type: Date, default: Date.now },
  playtimeSeconds: { type: Number, default: 0 },
  gamesPlayedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastIp: { type: String },
});

const GuestSession: Model<IGuestSession> = mongoose.models.GuestSession || mongoose.model<IGuestSession>('GuestSession', GuestSessionSchema);
export default GuestSession;
