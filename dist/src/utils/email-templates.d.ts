/**
 * Email templates for referral notifications
 */
interface EmailTemplate {
    subject: string;
    htmlContent: string;
    textContent: string;
}
/**
 * Welcome email for new user who signed up with referral code
 * New user gets: 8 initial credits + 10 referral bonus = 18 total
 */
export declare function referralSignupWelcomeEmail(newUserName: string, referrerName: string): EmailTemplate;
/**
 * Reward email for referrer when someone signs up with their code
 */
export declare function referralRewardEmail(referrerName: string, newUserName: string): EmailTemplate;
export {};
//# sourceMappingURL=email-templates.d.ts.map