/**
 * Send an email via Resend API
 * Non-blocking: logs errors but doesn't throw to avoid breaking signup flow
 */
export declare function sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<void>;
/**
 * Send multiple emails in parallel (non-blocking)
 */
export declare function sendEmails(emails: Array<{
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
}>): Promise<void>;
//# sourceMappingURL=email.service.d.ts.map