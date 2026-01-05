import mongoose, { Document, Schema } from "mongoose";

export enum TaskStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IImageTask extends Document {
  userId: mongoose.Types.ObjectId;
  status: TaskStatus;
  inputDriveId: string;
  outputDriveId?: string;
  cost: number;
  config: Record<string, any>;
  priceSnapshotId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const imageTaskSchema = new Schema<IImageTask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
      required: true,
    },
    inputDriveId: {
      type: String,
      required: true,
    },
    outputDriveId: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priceSnapshotId: {
      type: Schema.Types.ObjectId,
      ref: "PriceBook",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient querying by user and time
imageTaskSchema.index({ userId: 1, createdAt: -1 });
imageTaskSchema.index({ status: 1 });

export const ImageTask = mongoose.model<IImageTask>(
  "ImageTask",
  imageTaskSchema,
);
