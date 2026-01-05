import mongoose, { Document, Schema } from "mongoose";

export interface IStripeSession extends Document {
  userId: mongoose.Types.ObjectId;
  stripeId: string;
  amount: number;
  status: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stripeSessionSchema = new Schema<IStripeSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "succeeded", "failed", "canceled"],
      default: "pending",
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// Note: stripeId already has a unique index from schema definition
stripeSessionSchema.index({ userId: 1, createdAt: -1 });
stripeSessionSchema.index({ status: 1 });

export const StripeSession = mongoose.model<IStripeSession>(
  "StripeSession",
  stripeSessionSchema,
);
