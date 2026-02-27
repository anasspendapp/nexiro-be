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
export function referralSignupWelcomeEmail(
  newUserName: string,
  referrerName: string,
): EmailTemplate {
  const displayName = newUserName || "Welcome";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background-color: #050505;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .content { 
          background: #0f0f0f;
          padding: 40px 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
          border-radius: 0 0 12px 12px;
        }
        .content p { 
          color: #d1d5db;
          margin-bottom: 16px;
          font-weight: 400;
        }
        .content p strong { color: #ffffff; font-weight: 600; }
        .credits-box { 
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .credits-box h3 { 
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .credit-item { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          color: #d1d5db;
          font-weight: 400;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .credit-item:last-of-type { border-bottom: none; }
        .credit-item span:last-child { 
          color: #22c55e;
          font-weight: 600;
        }
        .credit-total { 
          font-size: 18px;
          font-weight: 700;
          color: #4f46e5;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          margin-top: 16px;
          text-align: right;
        }
        .cta-button { 
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
          color: white;
          padding: 12px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        .cta-button:hover { opacity: 0.9; }
        .center { text-align: center; }
        .help-text { 
          color: #9ca3af;
          font-size: 14px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer { 
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Nexiro!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 400; margin: 0;">You're all set to get started</p>
        </div>
        <div class="content">
          <p>Hi ${displayName},</p>
          
          <p>Thanks for joining the Nexiro community! 🚀 You've been invited by <strong>${referrerName}</strong>, and we've credited both of you with bonus credits to get you started right away.</p>
          
          <div class="credits-box">
            <h3>Your Credits</h3>
            <div class="credit-item">
              <span>Welcome Bonus</span>
              <span>+8</span>
            </div>
            <div class="credit-item">
              <span>Referral Signup Bonus</span>
              <span>+10</span>
            </div>
            <div class="credit-total">
              Total: 18 Credits
            </div>
          </div>
          
          <p>You can now start using your credits to enhance images with our AI-powered tools and unlock premium features. Let's create something amazing!</p>
          
          <div class="center">
            <a href="${process.env.APP_URL || "https://nexiro.app"}" class="cta-button">Get Started →</a>
          </div>
          
          <div class="help-text">
            <strong>Questions?</strong> Reply to this email or visit our help center.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nexiro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Welcome to Nexiro, ${displayName}!

Thanks for joining us! 🚀 You've been invited by ${referrerName}.

Your Credits:
━━━━━━━━━━━━━━━━━━━━━━
• Welcome Bonus: +8 credits
• Referral Signup Bonus: +10 credits
• Total: 18 Credits
━━━━━━━━━━━━━━━━━━━━━━

Start creating with your credits:
${process.env.APP_URL || "https://nexiro.app"}

Have questions? Reply to this email.

© ${new Date().getFullYear()} Nexiro. All rights reserved.`;

  return {
    subject: `Welcome to Nexiro, ${displayName}! 🎉 You've got +18 bonus credits`,
    htmlContent,
    textContent,
  };
}

/**
 * Reward email for referrer when someone signs up with their code
 */
export function referralRewardEmail(
  referrerName: string,
  newUserName: string,
): EmailTemplate {
  const displayName = referrerName || "Friend";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background-color: #050505;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .content { 
          background: #0f0f0f;
          padding: 40px 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
          border-radius: 0 0 12px 12px;
        }
        .content p { 
          color: #d1d5db;
          margin-bottom: 16px;
          font-weight: 400;
        }
        .content p strong { color: #ffffff; font-weight: 600; }
        .reward-box { 
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 24px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .reward-box h3 { 
          font-size: 16px;
          font-weight: 600;
          color: #22c55e;
          margin-bottom: 16px;
        }
        .credit-item { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          color: #d1d5db;
          font-weight: 500;
        }
        .credit-amount { 
          font-size: 24px;
          font-weight: 700;
          color: #22c55e;
        }
        .reward-description { 
          color: #9ca3af;
          font-size: 14px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(34, 197, 94, 0.2);
        }
        .cta-button { 
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
          color: white;
          padding: 12px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        .cta-button:hover { opacity: 0.9; }
        .center { text-align: center; }
        .referral-tip { 
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          margin-top: 24px;
          color: #d1d5db;
          font-size: 14px;
        }
        .footer { 
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Referral Reward Earned!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-weight: 400; margin: 0;">+10 Credits Added to Your Account</p>
        </div>
        <div class="content">
          <p>Hi ${displayName},</p>
          
          <p>Great news! <strong>${newUserName || "A new user"}</strong> just joined Nexiro using your referral code. We've credited your account with bonus credits as a thank you for helping us grow.</p>
          
          <div class="reward-box">
            <h3>You Earned</h3>
            <div class="credit-item">
              <span>Referral Reward</span>
              <span class="credit-amount">+10</span>
            </div>
            <p class="reward-description">Use these credits to enhance images with our AI-powered tools and unlock premium features.</p>
          </div>
          
          <p>Keep sharing your unique referral code to earn more credits! Every successful referral rewards you with <strong>+10 credits</strong>.</p>
          
          <div class="referral-tip">
            <strong>💡 Share your code:</strong> Your referral code helps friends get started and earns you rewards. Share it and watch the credits roll in!
          </div>
          
          <div class="center">
            <a href="${process.env.APP_URL || "https://nexiro.app"}/account" class="cta-button">View Your Credits →</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nexiro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `You Earned a Referral Reward!

Hi ${displayName},

Great news! ${newUserName || "A new user"} just joined Nexiro using your referral code. 🎉

━━━━━━━━━━━━━━━━━━━━━━
You Earned: +10 Credits
━━━━━━━━━━━━━━━━━━━━━━

Keep sharing your referral code to earn more credits!
Every successful referral rewards you with +10 credits.

View your credits:
${process.env.APP_URL || "https://nexiro.app"}/account

© ${new Date().getFullYear()} Nexiro. All rights reserved.`;

  return {
    subject: `You earned +10 credits! ${newUserName || "A new user"} joined via your referral 🎊`,
    htmlContent,
    textContent,
  };
}
