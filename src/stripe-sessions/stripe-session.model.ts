import { DataTypes, Model, Optional, ForeignKey } from "sequelize";
import sequelize from "../database";
import { User } from "../users/user.model";
import { Plan } from "../plans/plan.model";

export interface IStripeSession {
  id: number;
  userId: ForeignKey<number>;
  planId: ForeignKey<number>;
  stripeId: string;
  amount: number;
  status: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface StripeSessionCreationAttributes extends Optional<
  IStripeSession,
  "id" | "status" | "processedAt" | "createdAt" | "updatedAt"
> {}

export class StripeSession
  extends Model<IStripeSession, StripeSessionCreationAttributes>
  implements IStripeSession
{
  public id!: number;
  public userId!: ForeignKey<number>;
  public planId!: ForeignKey<number>;
  public stripeId!: string;
  public amount!: number;
  public status!: string;
  public processedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StripeSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "plans",
        key: "id",
      },
    },
    stripeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "stripe_sessions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["stripeId"],
      },
      {
        fields: ["userId", "createdAt"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);
