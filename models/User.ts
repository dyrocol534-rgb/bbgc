import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  favorites: string[]; // slugs of favorite games
  recentlyPlayed: string[]; // slugs of recently played games
  bio: string;
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
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
