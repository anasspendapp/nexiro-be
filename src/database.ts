import { Sequelize } from "sequelize";
require("dotenv").config();

// If using DATABASE_URL with special characters, they must be URL-encoded
// Or use individual connection parameters
const dbUrl = process.env.DATABASE_URL || "";

console.log("Connecting to database at:", dbUrl);

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This avoids the "no encryption" error
    },
  },
});

export default sequelize;
