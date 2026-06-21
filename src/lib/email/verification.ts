import {
  REPLY_TO_EMAIL,
  SENDER_EMAIL,
  SENDER_NAME,
  getSendGridErrorDetail,
  isEmailConfigured,
  sendGridClient,
} from "./client";

export type VerificationPurpose = "signup" | "change-email" | "change-password";

type SendVerificationEmailParams = {
  to: string;
  code: string;
  purpose?: VerificationPurpose;
};

function copyForPurpose(purpose: VerificationPurpose) {
  switch (purpose) {
    case "change-email":
      return {
        introLine:
          "Use this code to verify your new email address for your Oryx account.",
        subject: "Verify your new Oryx email",
      };
    case "change-password":
      return {
        introLine:
          "Use this code to confirm the password change for your Oryx account.",
        subject: "Confirm your Oryx password change",
      };
    default:
      return {
        introLine:
          "Use this code to verify your email address and finish creating your Oryx account.",
        subject: "Your Oryx verification code",
      };
  }
}

export async function sendVerificationCodeEmail({
  to,
  code,
  purpose = "signup",
}: SendVerificationEmailParams): Promise<void> {
  const sg = sendGridClient();
  if (!isEmailConfigured() || !sg) {
    throw new Error(
      "Email is not configured (set SENDGRID_API_KEY — same SendGrid account as AMBTN)"
    );
  }

  const { introLine, subject } = copyForPurpose(purpose);
  const text = [
    introLine,
    "",
    `Your code is: ${code}`,
    "",
    "Expires in 10 minutes. Don't share it with anyone.",
    "",
    "If you don't see this email within a minute, check your spam or junk folder.",
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px;">
      <p style="color: #374151; font-size: 16px;">${introLine}</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #111827; margin: 16px 0;">${code}</p>
      <p style="color: #6b7280; font-size: 14px;">Expires in 10 minutes. Don't share this code with anyone.</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
        If you don't see this email within a minute, check your <strong>spam or junk folder</strong>.
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 16px;">
        Sent from ${SENDER_EMAIL}
      </p>
    </div>
  `;

  try {
    await sg.send({
      to,
      from: { email: SENDER_EMAIL, name: SENDER_NAME },
      replyTo: { email: REPLY_TO_EMAIL, name: SENDER_NAME },
      subject,
      text,
      html,
    });
  } catch (err) {
    throw new Error(getSendGridErrorDetail(err));
  }
}
