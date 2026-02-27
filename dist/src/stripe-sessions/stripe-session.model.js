"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeSession = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class StripeSession extends sequelize_1.Model {
}
exports.StripeSession = StripeSession;
StripeSession.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    planId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "plans",
            key: "id",
        },
    },
    stripeId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "processing", "succeeded", "failed", "canceled"),
        allowNull: false,
        defaultValue: "pending",
    },
    processedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
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
});
//# sourceMappingURL=stripe-session.model.js.map