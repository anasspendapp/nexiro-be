import { User } from "../users/user.model";
/**
 * Generate a unique referral code for a user
 * Format: "fullName+nexiro" (slugified) or "nexiro-{ID}" if no name
 */
export declare function generateReferralCode(user: User): string;
/**
 * Validate and fetch a user by referral code
 * Returns the user if found, null otherwise
 */
export declare function validateReferralCode(code: string): Promise<User | null>;
/**
 * Generate a unique referral code with retry logic
 * If collision detected, append timestamp suffix
 */
export declare function generateUniqueReferralCode(user: User): Promise<string>;
//# sourceMappingURL=referral.d.ts.map