import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Rayavriti Learning";

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.emails.send({
            from: `${APP_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: `${otp} is your verification code`,
            html: generateOTPEmailHTML(otp, name),
        });

        if (error) {
            console.error("Email send error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error("Email service error:", err);
        return { success: false, error: "Failed to send email" };
    }
}

/**
 * Generate a 6 digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * HTML template for OTP email
 */
function generateOTPEmailHTML(otp: string, name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center;">
                            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                <span style="font-size: 28px;">🎓</span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px;">${APP_NAME}</h1>
                            <p style="color: #9ca3af; font-size: 14px; margin: 0;">Email Verification</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 0 32px 32px;">
                            <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                                Hi <strong style="color: #ffffff;">${name}</strong>, use the code below to verify your email address:
                            </p>
                            <!-- OTP Code -->
                            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #818cf8; font-family: 'Courier New', monospace;">${otp}</span>
                            </div>
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                                This code expires in <strong style="color: #d1d5db;">10 minutes</strong>. If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
