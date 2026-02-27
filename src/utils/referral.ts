import { User } from "../users/user.model";

/**
 * Generate a unique referral code for a user
 * Format: "fullName+nexiro" (slugified) or "nexiro-{ID}" if no name
 */
export function generateReferralCode(user: User): string {
  if (user.fullName && user.fullName.trim()) {
    // Slugify name: lowercase, replace spaces with hyphens, remove special chars
    const slugified = user.fullName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return slugified ? `${slugified}+nexiro` : `nexiro-${user.id}`;
  }
  return `nexiro-${user.id}`;
}

/**
 * Validate and fetch a user by referral code
 * Returns the user if found, null otherwise
 */
export async function validateReferralCode(code: string): Promise<User | null> {
  if (!code || typeof code !== "string") {
    return null;
  }

  try {
    const user = await User.findOne({
      where: { referralCode: code },
      attributes: ["id", "email", "fullName"],
    });
    return user;
  } catch (error) {
    console.error("Error validating referral code:", error);
    return null;
  }
}

/**
 * Generate a unique referral code with retry logic
 * If collision detected, append timestamp suffix
 */
export async function generateUniqueReferralCode(user: User): Promise<string> {
  let code = generateReferralCode(user);
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    try {
      const existing = await User.findOne({
        where: { referralCode: code },
      });

      if (!existing) {
        return code;
      }

      // If collision, append timestamp-based suffix
      const suffix = `-${Date.now().toString().slice(-4)}${attempt}`;
      code = generateReferralCode(user) + suffix;
      attempt++;
    } catch (error) {
      console.error("Error checking referral code uniqueness:", error);
      attempt++;
    }
  }

  // Fallback: use ID with timestamp
  return `nexiro-${user.id}-${Date.now()}`;
}
