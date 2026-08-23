import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: mongoose.Types.ObjectId | string;
  deviceType?: 'Mobile' | 'Tablet' | 'Desktop';
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema: Schema<IPushSubscription> = new Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deviceType: { type: String, enum: ['Mobile', 'Tablet', 'Desktop'], default: 'Desktop' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes
PushSubscriptionSchema.index({ userId: 1 });

const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
