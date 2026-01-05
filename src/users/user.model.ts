import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  isVerified: boolean;
  googleDriveFolderId?: string;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId; // Required if not using Google OAuth
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleDriveFolderId: {
      type: String,
    },
    creditBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Note: email and googleId already have unique indexes from schema definition
// No additional index() calls needed for unique fields

export const User = mongoose.model<IUser>("User", userSchema);
