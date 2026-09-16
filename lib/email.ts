import nodemailer from "nodemailer";

function createTransporter(user?: string, pass?: string) {
  if (!user || !pass) return null;
  const cleanPass = pass.replace(/\s+/g, "");
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: cleanPass,
    },
  });
}

const primaryTransporter = createTransporter(
  process.env.GMAIL_USER,
  process.env.GMAIL_APP_PASSWORD
);

const fallbackTransporter = createTransporter(
  process.env.GMAIL_USER2,
  process.env.GMAIL_APP_PASSWORD2
);

export async function sendOtpEmail({ to, otp }: { to: string; otp: string }) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bluebuff Games";
  const fromAddress = process.env.GMAIL_USER || "crew.bluebuff@gmail.com";

  const subject = `${otp} is your ${siteName} verification code`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0c0e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 440px; background-color: #141416; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          <!-- Header Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ff7a1a, #ff9500, #ffb340);"></td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <!-- Brand Title -->
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${siteName}
              </h1>
              <p style="margin: 0 0 28px; font-size: 13px; color: #a1a1aa;">
                Sign in to your gamer account
              </p>

              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  One-Time Verification Code
                </p>
                <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ff9500; padding: 8px 0; user-select: all;">
                  ${otp}
                </div>
                <p style="margin: 12px 0 0; font-size: 11px; color: #71717a;">
                  Valid for 10 minutes • Never share this code
                </p>
              </div>

              <p style="margin: 0 0 20px; font-size: 12px; color: #71717a; line-height: 1.5;">
                If you did not request this login code, you can safely ignore this email. No password is required.
              </p>

              <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0 16px;">

              <p style="margin: 0; font-size: 11px; color: #52525b;">
                © ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Your ${siteName} verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore.`;

  const mailOptions = {
    from: `"${siteName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  };

  // Try primary transporter first
  if (primaryTransporter) {
    try {
      const info = await primaryTransporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (primaryError) {
      console.warn("Primary Gmail transporter failed, attempting fallback...", primaryError);
    }
  }

  // Fallback transporter
  if (fallbackTransporter) {
    try {
      const fallbackFrom = process.env.GMAIL_USER2 || fromAddress;
      const info = await fallbackTransporter.sendMail({
        ...mailOptions,
        from: `"${siteName}" <${fallbackFrom}>`,
      });
      return { success: true, messageId: info.messageId };
    } catch (fallbackError) {
      console.error("Fallback Gmail transporter also failed:", fallbackError);
      throw new Error("Failed to send verification email. Please try again.");
    }
  }

  throw new Error("Email service is not configured.");
}
