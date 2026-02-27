/**
 * Email Test Script
 *
 * Usage:
 * npx ts-node data/scripts/test-email.ts welcome
 * npx ts-node data/scripts/test-email.ts reward
 */

import * as dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3000";
const TEST_EMAIL = "test@example.com"; // Change this to your test email

async function sendTestEmail(emailType: "welcome" | "reward") {
  try {
    console.log(`\n📧 Sending test ${emailType} email...\n`);

    const payload =
      emailType === "welcome"
        ? {
            email: TEST_EMAIL,
            emailType: "welcome",
            newUserName: "Test User",
            referrerName: "John Referrer",
          }
        : {
            email: TEST_EMAIL,
            emailType: "reward",
            newUserName: "Alice Johnson",
            referrerName: "Bob Referrer",
          };

    console.log("📤 Request payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/api/users/test-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data, null, 2));
    }

    console.log("\n✅ Success!");
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log(`\n📬 Email sent to: ${TEST_EMAIL}`);
  } catch (error: any) {
    console.error("\n❌ Error sending test email:");
    console.error(error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const emailType = args[0];

if (!emailType) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Email Test Script                         ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  npx ts-node data/scripts/test-email.ts <type>

Email Types:
  welcome  - Send a welcome/onboarding email
  reward   - Send a referral reward email

Examples:
  npx ts-node data/scripts/test-email.ts welcome
  npx ts-node data/scripts/test-email.ts reward

Environment Variables:
  API_URL    - API base URL (default: http://localhost:3000)
  TEST_EMAIL - Test recipient email (default: test@example.com)

Note:
  Make sure your Nexiro backend is running before executing this script.
  Update TEST_EMAIL in this file to send to your actual email address.
  `);
  process.exit(0);
}

if (emailType === "welcome") {
  sendTestEmail("welcome");
} else if (emailType === "reward") {
  sendTestEmail("reward");
} else {
  console.error(`❌ Unknown email type: ${emailType}`);
  console.error("Use 'welcome' or 'reward'");
  process.exit(1);
}
