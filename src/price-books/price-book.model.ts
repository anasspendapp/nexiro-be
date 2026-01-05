import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPricePlan {
  name: string;
  price: number;
  credits: number;
  description?: string;
  isActive: boolean;
}

export interface IPriceBook extends Document {
  versionTag: string;
  plans: IPricePlan[];
  creditsPerEnhancement: number;
  effectiveFrom: Date;
  termsOfService: string;
  createdAt: Date;
  updatedAt: Date;
  getPlanByName(planName: string): IPricePlan | undefined;
}

export interface IPriceBookModel extends Model<IPriceBook> {
  getCurrentPrice(): Promise<IPriceBook | null>;
}

const pricePlanSchema = new Schema<IPricePlan>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const priceBookSchema = new Schema<IPriceBook>(
  {
    versionTag: {
      type: String,
      required: true,
      unique: true,
    },
    plans: {
      type: [pricePlanSchema],
      required: true,
      validate: {
        validator: function (plans: IPricePlan[]) {
          return plans.length > 0;
        },
        message: "At least one pricing plan is required",
      },
    },
    creditsPerEnhancement: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
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

// Static method to get current active price book
priceBookSchema.statics.getCurrentPrice = async function () {
  return this.findOne({
    effectiveFrom: { $lte: new Date() },
  }).sort({ effectiveFrom: -1 });
};

// Method to get plan by name
priceBookSchema.methods.getPlanByName = function (planName: string) {
  return this.plans.find(
    (plan: IPricePlan) => plan.name.toLowerCase() === planName.toLowerCase(),
  );
};

export const PriceBook = mongoose.model<IPriceBook, IPriceBookModel>(
  "PriceBook",
  priceBookSchema,
);
