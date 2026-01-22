"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBook = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class PriceBook extends sequelize_1.Model {
    // Instance method to get plan by name
    async getPlanByName(planName) {
        const { Plan } = require("../plans/plan.model");
        const plans = await Plan.findAll({
            where: {
                priceBookId: this.id,
                isActive: true,
            },
        });
        return plans.find((plan) => plan.name.toLowerCase() === planName.toLowerCase());
    }
    // Static method to get current active price book
    static async getCurrentPrice() {
        const { Plan } = require("../plans/plan.model");
        return this.findOne({
            where: database_1.default.where(database_1.default.col("effectiveFrom"), "<=", new Date()),
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
exports.PriceBook = PriceBook;
PriceBook.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    versionTag: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    creditsPerEnhancement: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0,
        },
    },
    effectiveFrom: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    termsOfService: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
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
});
//# sourceMappingURL=price-book.model.js.map