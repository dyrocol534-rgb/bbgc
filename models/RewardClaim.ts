import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRewardClaim extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  rewardId: mongoose.Types.ObjectId;
  rewardTitle: string;
  game: string;
  requiredXp: number;
  iconUrl?: string;
  // User game credentials & contact
  playerId: string; // Character ID / User ID
  zoneId?: string; // For games like MLBB
  serverOrRegion?: string;
  contactInfo?: string; // Phone or WhatsApp or notes
  userNote?: string;

  // Fulfillment status
  status: "pending" | "processing" | "completed" | "rejected";
  adminNotes?: string;
  voucherCode?: string; // Voucher code or transaction ref if fulfilled
  claimedAt: Date;
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RewardClaimSchema: Schema<IRewardClaim> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    rewardId: { type: Schema.Types.ObjectId, ref: "Reward", required: true },
    rewardTitle: { type: String, required: true },
    game: { type: String, required: true },
    requiredXp: { type: Number, required: true },
    iconUrl: { type: String, default: "" },

    playerId: { type: String, required: true, trim: true },
    zoneId: { type: String, default: "", trim: true },
    serverOrRegion: { type: String, default: "", trim: true },
    contactInfo: { type: String, default: "", trim: true },
    userNote: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },
    voucherCode: { type: String, default: "" },
    claimedAt: { type: Date, default: Date.now },
    fulfilledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup of 7-day cooldown and admin queue
RewardClaimSchema.index({ userId: 1, rewardId: 1, claimedAt: -1 });
RewardClaimSchema.index({ userEmail: 1, claimedAt: -1 });
RewardClaimSchema.index({ status: 1, claimedAt: -1 });

const RewardClaim: Model<IRewardClaim> =
  mongoose.models.RewardClaim ||
  mongoose.model<IRewardClaim>("RewardClaim", RewardClaimSchema);

export default RewardClaim;
