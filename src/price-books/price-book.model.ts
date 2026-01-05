import mongoose, { Document, Schema } from "mongoose";

export interface IPriceBook extends Document {
  versionTag: string;
  pricePerCredit: number;
  creditsPerEnhancement: number;
  effectiveFrom: Date;
  termsOfService: string;
  createdAt: Date;
  updatedAt: Date;
}

const priceBookSchema = new Schema<IPriceBook>(
  {
    versionTag: {
      type: String,
      required: true,
      unique: true,
    },
    pricePerCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsPerEnhancement: {
      type: Number,
      required: true,
      min: 0,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    termsOfService: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for finding current price (effectiveFrom <= now)
priceBookSchema.index({ effectiveFrom: -1 });

// Static method to get current active price
priceBookSchema.statics.getCurrentPrice = async function () {
  return this.findOne({
    effectiveFrom: { $lte: new Date() },
  }).sort({ effectiveFrom: -1 });
};

export const PriceBook = mongoose.model<IPriceBook>(
  "PriceBook",
  priceBookSchema,
);
