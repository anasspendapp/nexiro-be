import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";

export interface IPlan {
  id: number;
  name: string;
  price: number;
  credits: number;
  description?: string;
  isActive: boolean;
  priceBookId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanCreationAttributes extends Optional<
  IPlan,
  "id" | "description" | "isActive" | "createdAt" | "updatedAt"
> {}

export class Plan
  extends Model<IPlan, PlanCreationAttributes>
  implements IPlan
{
  public id!: number;
  public name!: string;
  public price!: number;
  public credits!: number;
  public description?: string;
  public isActive!: boolean;
  public priceBookId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to get all active plans
  public static async getActivePlans(): Promise<Plan[]> {
    return this.findAll({
      where: { isActive: true },
      order: [["price", "ASC"]],
    });
  }

  // Static method to get plan by name
  public static async getPlanByName(name: string): Promise<Plan | null> {
    return this.findOne({
      where: { name, isActive: true },
    });
  }
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    priceBookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "price_books",
        key: "id",
      },
      onDelete: "CASCADE",
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
    tableName: "plans",
    timestamps: true,
    indexes: [
      {
        fields: ["priceBookId"],
      },
      {
        fields: ["name"],
      },
      {
        fields: ["isActive"],
      },
    ],
  },
);
