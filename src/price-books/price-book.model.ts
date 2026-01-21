import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";

export interface IPriceBook {
  id: number;
  versionTag: string;
  creditsPerEnhancement: number;
  effectiveFrom: Date;
  termsOfService: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PriceBookCreationAttributes extends Optional<
  IPriceBook,
  "id" | "creditsPerEnhancement" | "effectiveFrom" | "createdAt" | "updatedAt"
> {}

export class PriceBook
  extends Model<IPriceBook, PriceBookCreationAttributes>
  implements IPriceBook
{
  public id!: number;
  public versionTag!: string;
  public creditsPerEnhancement!: number;
  public effectiveFrom!: Date;
  public termsOfService!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association placeholder
  public readonly plans?: any[];

  // Instance method to get plan by name
  public async getPlanByName(planName: string): Promise<any | undefined> {
    const { Plan } = require("../plans/plan.model");
    const plans = await Plan.findAll({
      where: {
        priceBookId: this.id,
        isActive: true,
      },
    });
    return plans.find(
      (plan: any) => plan.name.toLowerCase() === planName.toLowerCase(),
    );
  }

  // Static method to get current active price book
  public static async getCurrentPrice(): Promise<PriceBook | null> {
    const { Plan } = require("../plans/plan.model");
    return this.findOne({
      where: sequelize.where(sequelize.col("effectiveFrom"), "<=", new Date()),
      order: [["effectiveFrom", "DESC"]],
      include: [
        {
          model: Plan,
          as: "plans",
        },
      ],
    });
  }
}

PriceBook.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    versionTag: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    creditsPerEnhancement: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    termsOfService: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "price_books",
    timestamps: true,
    indexes: [
      {
        fields: ["effectiveFrom"],
      },
      {
        unique: true,
        fields: ["versionTag"],
      },
    ],
  },
);
