"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class Plan extends sequelize_1.Model {
    // Static method to get all active plans
    static async getActivePlans() {
        return this.findAll({
            where: { isActive: true },
            order: [["price", "ASC"]],
        });
    }
    // Static method to get plan by name
    static async getPlanByName(name) {
        return this.findOne({
            where: { name, isActive: true },
        });
    }
}
exports.Plan = Plan;
Plan.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    credits: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    stripeKey: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "stripe_key",
        validate: {
            notEmpty: true,
        },
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    priceBookId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "price_books",
            key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
});
//# sourceMappingURL=plan.model.js.map