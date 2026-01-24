"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
        set(value) {
            this.setDataValue("email", value.toLowerCase().trim());
        },
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    googleId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    googleDriveFolderId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    creditBalance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    planId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "plans",
            key: "id",
        },
        onDelete: "SET NULL",
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
                    [sequelize_1.Op.ne]: null,
                },
            },
        },
    ],
});
//# sourceMappingURL=user.model.js.map