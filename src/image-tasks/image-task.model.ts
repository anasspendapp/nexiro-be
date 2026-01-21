import { DataTypes, Model, Optional, ForeignKey } from "sequelize";
import sequelize from "../database";
import { User } from "../users/user.model";
import { PriceBook } from "../price-books/price-book.model";

export enum TaskStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IImageTask {
  id: number;
  userId: ForeignKey<number>;
  status: TaskStatus;
  inputDriveId: string;
  outputDriveId?: string;
  cost: number;
  config: Record<string, any>;
  priceSnapshotId: ForeignKey<number>;
  createdAt: Date;
  updatedAt: Date;
}

interface ImageTaskCreationAttributes extends Optional<
  IImageTask,
  "id" | "status" | "outputDriveId" | "config" | "createdAt" | "updatedAt"
> {}

export class ImageTask
  extends Model<IImageTask, ImageTaskCreationAttributes>
  implements IImageTask
{
  public id!: number;
  public userId!: ForeignKey<number>;
  public status!: TaskStatus;
  public inputDriveId!: string;
  public outputDriveId?: string;
  public cost!: number;
  public config!: Record<string, any>;
  public priceSnapshotId!: ForeignKey<number>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ImageTask.init(
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
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.PENDING,
    },
    inputDriveId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outputDriveId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    priceSnapshotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "price_books",
        key: "id",
      },
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
    tableName: "image_tasks",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "createdAt"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);

// Define associations
ImageTask.belongsTo(User, { foreignKey: "userId", as: "user" });
ImageTask.belongsTo(PriceBook, {
  foreignKey: "priceSnapshotId",
  as: "priceSnapshot",
});
