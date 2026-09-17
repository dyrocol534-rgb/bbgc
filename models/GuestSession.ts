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

// Auto-purge abandoned guest sessions after 90 days (7,776,000 seconds) to prevent unbounded storage bloat
GuestSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 90 * 86400 });
GuestSessionSchema.index({ lastActiveAt: -1 });

const GuestSession: Model<IGuestSession> = mongoose.models.GuestSession || mongoose.model<IGuestSession>('GuestSession', GuestSessionSchema);
export default GuestSession;
