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
  referralCode: string;
  referredById?: number;
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
  | "referralCode"
  | "referredById"
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
  public referralCode!: string;
  public referredById?: number;

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
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    referredById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
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
        fields: ["referralCode"],
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
    hooks: {
      beforeCreate: async (user: any) => {
        // Auto-generate referral code if not provided
        if (!user.referralCode) {
          // Generate code based on fullName or ID
          const generateCode = () => {
            if (user.fullName && user.fullName.trim()) {
              const slugified = user.fullName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");

              return slugified ? `${slugified}+nexiro` : `nexiro-${Date.now()}`;
            }
            return `nexiro-${Date.now()}`;
          };

          user.referralCode = generateCode();
        }
      },
    },
  },
);
