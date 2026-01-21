import { DataTypes, Model, Optional, ForeignKey } from "sequelize";
import sequelize from "../database";
import { User } from "../users/user.model";

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export interface ILedger {
  id: number;
  userId: ForeignKey<number>;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  referenceId?: number;
  referenceModel?: string;
  description?: string;
  timestamp: Date;
}

interface LedgerCreationAttributes extends Optional<
  ILedger,
  "id" | "referenceId" | "referenceModel" | "description" | "timestamp"
> {}

export class Ledger
  extends Model<ILedger, LedgerCreationAttributes>
  implements ILedger
{
  public id!: number;
  public userId!: ForeignKey<number>;
  public type!: TransactionType;
  public amount!: number;
  public balanceAfter!: number;
  public referenceId?: number;
  public referenceModel?: string;
  public description?: string;
  public timestamp!: Date;
}

Ledger.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referenceModel: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["ImageTask", "StripeSession"]],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "ledgers",
    timestamps: false,
    indexes: [
      {
        fields: ["userId", "timestamp"],
      },
      {
        fields: ["referenceId"],
      },
    ],
    hooks: {
      beforeUpdate: () => {
        throw new Error("Ledger entries are immutable and cannot be updated");
      },
      beforeDestroy: () => {
        throw new Error("Ledger entries are immutable and cannot be deleted");
      },
      beforeBulkUpdate: () => {
        throw new Error("Ledger entries are immutable and cannot be updated");
      },
      beforeBulkDestroy: () => {
        throw new Error("Ledger entries are immutable and cannot be deleted");
      },
    },
  },
);

// Define associations
Ledger.belongsTo(User, { foreignKey: "userId", as: "user" });
