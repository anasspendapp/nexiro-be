import * as fs from "fs";
import * as path from "path";
import { User } from "../src/users/user.model";
import { Plan } from "../src/plans/plan.model";
import { PriceBook } from "../src/price-books/price-book.model";
import sequelize from "../src/database";
import { initializeAssociations } from "../src/models/associations";

interface OldUserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  usageCount: string;
  isPro: string;
  createdAt: string;
  updatedAt: string;
  plan: string;
}

async function migrateUsers() {
  try {
    // Read the users.json file
    const usersJsonPath = path.join(__dirname, "users.json");
    const usersData: OldUserData[] = JSON.parse(
      fs.readFileSync(usersJsonPath, "utf-8"),
    );

    console.log(`Found ${usersData.length} users to migrate`);

    // Connect to database
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Initialize associations
    initializeAssociations();

    // Sync models (create tables if not exists)
    await sequelize.sync({ alter: false });
    console.log("Database models synced");

    let successCount = 0;
    let errorCount = 0;

    // Transform and insert each user
    for (const oldUser of usersData) {
      try {
        // Extract googleId from password field (format: "GOOGLE_AUTH_USER_0.xxxxx")
        // The actual ID is after the last dot
        const googleId = oldUser.password.startsWith("GOOGLE_AUTH_USER")
          ? oldUser.password.split(".")[1] // Extract the random part after the dot
          : undefined;

        // Combine firstName and lastName to create fullName
        const fullName = `${oldUser.firstName} ${oldUser.lastName}`.trim();

        // Check if user already exists
        const existingUser = await User.findOne({
          where: { email: oldUser.email },
        });

        if (existingUser) {
          console.log(`User ${oldUser.email} already exists, skipping...`);
          continue;
        }

        // Create new user with transformed data
        await User.create({
          id: parseInt(oldUser.id),
          email: oldUser.email,
          fullName: fullName,
          googleId: googleId,
          isVerified: true, // Existing users should be verified
          creditBalance: parseInt(oldUser.usageCount), // Start with 0 credits
          createdAt: new Date(oldUser.createdAt),
          updatedAt: new Date(oldUser.updatedAt),
        });

        successCount++;
        console.log(`✓ Migrated user: ${oldUser.email} (ID: ${oldUser.id})`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Error migrating user ${oldUser.email}:`, error);
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total users: ${usersData.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("========================\n");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
    console.log("Database connection closed");
  }
}

// Run the migration
migrateUsers();
