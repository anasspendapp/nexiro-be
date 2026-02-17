import { DataTypes, Model, Optional, ForeignKey } from "sequelize";
import sequelize from "../database";
import { User } from "../users/user.model";

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
  inputDriveId?: string | null;
  outputDriveId?: string | null;
  cost: number;
  config: Record<string, any>;
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
  public inputDriveId?: string | null;
  public outputDriveId?: string | null;
  public cost!: number;
  public config!: Record<string, any>;

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
      allowNull: true,
    },
    outputDriveId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
