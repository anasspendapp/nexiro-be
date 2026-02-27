"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ledger = exports.TransactionType = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const user_model_1 = require("../users/user.model");
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "credit";
    TransactionType["DEBIT"] = "debit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
class Ledger extends sequelize_1.Model {
}
exports.Ledger = Ledger;
Ledger.init({
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
    type: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TransactionType)),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    balanceAfter: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    referenceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    referenceModel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [["ImageTask", "StripeSession", "Referral"]],
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
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
});
// Define associations
Ledger.belongsTo(user_model_1.User, { foreignKey: "userId", as: "user" });
//# sourceMappingURL=ledger.model.js.map