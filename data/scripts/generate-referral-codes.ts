/**
 * Migration script to generate referral codes for existing users
 *
 * Usage:
 * - Development: npx ts-node data/scripts/generate-referral-codes.ts
 * - Or add as npm script: "generate-referral-codes": "ts-node data/scripts/generate-referral-codes.ts"
 */

import sequelize from "../../src/database";
import { User } from "../../src/users/user.model";
import { generateUniqueReferralCode } from "../../src/utils/referral";

async function generateReferralCodesForExistingUsers() {
  try {
    console.log("🔄 Starting referral code generation for existing users...");

    // Authenticate database connection
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Find all users (to assign referral codes to those who don't have them)
    const allUsers = await User.findAll();

    const usersWithoutCodes = allUsers.filter((user) => !user.referralCode);

    if (usersWithoutCodes.length === 0) {
      console.log("✅ All users already have referral codes!");
      return;
    }

    console.log(
      `📝 Found ${usersWithoutCodes.length} users without referral codes`,
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Process each user
    for (const user of usersWithoutCodes) {
      try {
        const referralCode = await generateUniqueReferralCode(user);

        await user.update({ referralCode });

        console.log(`✓ ${user.email} → ${referralCode}`);
        successCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`✗ ${user.email} → Error: ${errorMsg}`);
        errors.push({
          email: user.email,
          error: errorMsg,
        });
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Total: ${successCount + errorCount}`);

    if (errors.length > 0) {
      console.log("\n⚠️  Failed Users:");
      errors.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`);
      });
    }

    if (successCount === usersWithoutCodes.length) {
      console.log("\n✅ All users successfully assigned referral codes!");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("\n🔚 Database connection closed");
  }
}

// Run the migration
generateReferralCodesForExistingUsers();
