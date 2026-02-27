import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend API
 * Non-blocking: logs errors but doesn't throw to avoid breaking signup flow
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
): Promise<void> {
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
  } catch (error) {
    // Non-blocking: log error but don't throw to avoid breaking signup flow
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
}

/**
 * Send multiple emails in parallel (non-blocking)
 */
export async function sendEmails(
  emails: Array<{
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }>,
): Promise<void> {
  await Promise.all(
    emails.map((email) =>
      sendEmail(email.to, email.subject, email.htmlContent, email.textContent),
    ),
  );
}
