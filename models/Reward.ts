import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReward extends Document {
  title: string;
  game: string;
  requiredXp: number;
  iconUrl?: string;
  description: string;
  stockStatus: "in_stock" | "out_of_stock";
  isComingSoon: boolean;
  badge?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema: Schema<IReward> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    game: { type: String, required: true, trim: true },
    requiredXp: { type: Number, required: true, min: 0 },
    iconUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "in_stock",
    },
    isComingSoon: { type: Boolean, default: false },
    badge: { type: String, default: "" },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

RewardSchema.index({ active: 1, sortOrder: 1, requiredXp: 1 });

const Reward: Model<IReward> =
  mongoose.models.Reward || mongoose.model<IReward>("Reward", RewardSchema);

export default Reward;
