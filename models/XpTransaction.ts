import mongoose, { Schema, Document, Model } from "mongoose";

export interface IXpTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  amount: number; // positive for additions, negative for deductions
  type:
    | "admin_adjustment"
    | "reward_redemption"
    | "reward_refund"
    | "gameplay"
    | "daily_login"
    | "streak_bonus"
    | "referral";
  description: string;
  balanceAfter: number;
  adminEmail?: string;
  referenceId?: string; // e.g. Reward claim ID or Game ID
  createdAt: Date;
}

const XpTransactionSchema: Schema<IXpTransaction> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        "admin_adjustment",
        "reward_redemption",
        "reward_refund",
        "gameplay",
        "daily_login",
        "streak_bonus",
        "referral",
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    balanceAfter: { type: Number, required: true },
    adminEmail: { type: String, trim: true },
    referenceId: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

XpTransactionSchema.index({ userId: 1, createdAt: -1 });
XpTransactionSchema.index({ userEmail: 1, createdAt: -1 });
XpTransactionSchema.index({ type: 1, createdAt: -1 });
XpTransactionSchema.index({ createdAt: -1 });

const XpTransaction: Model<IXpTransaction> =
  mongoose.models.XpTransaction ||
  mongoose.model<IXpTransaction>("XpTransaction", XpTransactionSchema);

export default XpTransaction;
