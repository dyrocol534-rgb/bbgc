import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  gameSlug: string;
  userEmail: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema({
  gameSlug: { type: String, required: true },
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Feedback: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;
