"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageTask = exports.TaskStatus = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const user_model_1 = require("../users/user.model");
const price_book_model_1 = require("../price-books/price-book.model");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["PROCESSING"] = "processing";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
class ImageTask extends sequelize_1.Model {
}
exports.ImageTask = ImageTask;
ImageTask.init({
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
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
        defaultValue: TaskStatus.PENDING,
    },
    inputDriveId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    outputDriveId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cost: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    config: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    priceSnapshotId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "price_books",
            key: "id",
        },
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
});
// Define associations
ImageTask.belongsTo(user_model_1.User, { foreignKey: "userId", as: "user" });
ImageTask.belongsTo(price_book_model_1.PriceBook, {
    foreignKey: "priceSnapshotId",
    as: "priceSnapshot",
});
//# sourceMappingURL=image-task.model.js.map