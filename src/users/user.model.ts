import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../database";

export interface IUser {
  id: number;
  email: string;
  fullName?: string;
  image?: string;
  passwordHash?: string;
  googleId?: string;
  isVerified: boolean;
  googleDriveFolderId?: string;
  creditBalance: number;
  planId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<
  IUser,
  | "id"
  | "fullName"
  | "passwordHash"
  | "googleId"
  | "isVerified"
  | "googleDriveFolderId"
  | "creditBalance"
  | "planId"
  | "createdAt"
  | "updatedAt"
> {}

export class User
  extends Model<IUser, UserCreationAttributes>
  implements IUser
{
  public id!: number;
  public email!: string;
  public fullName?: string;
  public image?: string;
  public passwordHash?: string;
  public googleId?: string;
  public isVerified!: boolean;
  public googleDriveFolderId?: string;
  public creditBalance!: number;
  public planId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value: string) {
        this.setDataValue("email", value.toLowerCase().trim());
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    googleDriveFolderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creditBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "plans",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
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
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["googleId"],
        where: {
          googleId: {
            [Op.ne]: null,
          },
        },
      },
    ],
  },
);
