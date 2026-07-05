import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  favorites: string[]; // slugs of favorite games
  recentlyPlayed: string[]; // slugs of recently played games
  bio: string;
  xp: number;
  lifetimeXp: number;
  currentStreak: number;
  lastStreakDate?: Date;
  playtimeSeconds: number;
  gamesPlayedCount: number;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  referralRewardPaid: boolean;
  phone?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  favorites: { type: [String], default: [] },
  recentlyPlayed: { type: [String], default: [] },
  bio: { type: String, default: "" },
  xp: { type: Number, default: 0 },
  lifetimeXp: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  playtimeSeconds: { type: Number, default: 0 },
  gamesPlayedCount: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referralRewardPaid: { type: Boolean, default: false },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
