import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  type: "login" | "signup" | "playtime_milestone" | "reward_claim" | "xp_adjustment";
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  userImage?: string;
  title: string;
  description: string;
  meta?: {
    minutes?: number;
    hours?: number;
    gameTitle?: string;
    gameSlug?: string;
    amount?: number;
    provider?: string; // google or email-otp
    ip?: string;
    status?: string;
    playerId?: string;
  };
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    type: {
      type: String,
      enum: ["login", "signup", "playtime_milestone", "reward_claim", "xp_adjustment"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ type: 1, createdAt: -1 });
ActivityLogSchema.index({ userEmail: 1, createdAt: -1 });

// Auto expire after 60 days to prevent uncontrolled collection growth
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 86400 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
