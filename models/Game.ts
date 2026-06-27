import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGame extends Document {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string[];
  tags: string[];
  source: "own" | "aggregated";
  buildType: "html5" | "unity-webgl" | "construct" | "iframe-external";
  playUrl: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "any";
  playCount: number;
  rating: { avg: number; count: number };
  status: "draft" | "published";
  featured: boolean;
  likes: string[];
  dislikes: string[];
  developer: string;
  platforms: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema<IGame> = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  category: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  source: { type: String, enum: ["own", "aggregated"], required: true },
  buildType: { type: String, enum: ["html5", "unity-webgl", "construct", "iframe-external"], required: true },
  playUrl: { type: String, required: true },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 600 },
  orientation: { type: String, enum: ["landscape", "portrait", "any"], default: "any" },
  playCount: { type: Number, default: 0 },
  rating: {
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  featured: { type: Boolean, default: false },
  likes: { type: [String], default: [] },
  dislikes: { type: [String], default: [] },
  developer: { type: String, default: "TapAndPlay" },
  platforms: { type: String, default: "Browser (desktop, mobile, tablet)" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Game: Model<IGame> = mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
export default Game;
