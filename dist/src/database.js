"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
require("dotenv").config();
// If using DATABASE_URL with special characters, they must be URL-encoded
// Or use individual connection parameters
const dbUrl = process.env.DATABASE_URL || "";
console.log("Connecting to database at:", dbUrl);
const sequelize = new sequelize_1.Sequelize(dbUrl, {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // This avoids the "no encryption" error
        },
    },
});
exports.default = sequelize;
//# sourceMappingURL=database.js.map