"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendEmails = sendEmails;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
/**
 * Send an email via Resend API
 * Non-blocking: logs errors but doesn't throw to avoid breaking signup flow
 */
async function sendEmail(to, subject, htmlContent, textContent) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("⚠️  RESEND_API_KEY not configured. Email not sent to:", to);
            return;
        }
        const fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@nexiro.io";
        const result = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html: htmlContent,
            text: textContent,
        });
        if (result.error) {
            console.error(`❌ Resend error sending email to ${to}:`, result.error);
            return;
        }
        console.log(`✅ Email sent successfully to ${to} (ID: ${result.data?.id})`);
    }
    catch (error) {
        // Non-blocking: log error but don't throw to avoid breaking signup flow
        console.error(`❌ Failed to send email to ${to}:`, error);
    }
}
/**
 * Send multiple emails in parallel (non-blocking)
 */
async function sendEmails(emails) {
    await Promise.all(emails.map((email) => sendEmail(email.to, email.subject, email.htmlContent, email.textContent)));
}
//# sourceMappingURL=email.service.js.map