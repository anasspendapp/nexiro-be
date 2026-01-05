import mongoose, { Document, Schema } from "mongoose";

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export interface ILedger extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  referenceId?: mongoose.Types.ObjectId;
  referenceModel?: string;
  description?: string;
  timestamp: Date;
}

const ledgerSchema = new Schema<ILedger>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["ImageTask", "StripeSession"],
    },
    description: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  },
);

// Indexes for audit queries
ledgerSchema.index({ userId: 1, timestamp: -1 });
ledgerSchema.index({ referenceId: 1 });

// Make the collection append-only by preventing updates and deletes
ledgerSchema.pre("updateOne", function () {
  throw new Error("Ledger entries are immutable and cannot be updated");
});

ledgerSchema.pre("findOneAndUpdate", function () {
  throw new Error("Ledger entries are immutable and cannot be updated");
});

ledgerSchema.pre("deleteOne", function () {
  throw new Error("Ledger entries are immutable and cannot be deleted");
});

export const Ledger = mongoose.model<ILedger>("Ledger", ledgerSchema);
