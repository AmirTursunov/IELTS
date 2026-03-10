// lib/email.ts - GMAIL BILAN EMAIL YUBORISH

import nodemailer from "nodemailer";

// Email transporter yaratish
export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─── Generic sender ────────────────────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  const info = await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  console.log("Email sent:", info.messageId);
  return info;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const APP_NAME = () => process.env.APP_NAME || "IELTS Platform";
const APP_URL = () => process.env.NEXT_PUBLIC_API_URL || "https://yoursite.com";
const SUPPORT = () => process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || "";

const STATUS_COLORS: Record<string, string> = {
  vip: "#7c3aed",
  premium: "#2563eb",
  free: "#6b7280",
};

function baseLayout(color: string, headerText: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${color};padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">${APP_NAME()}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${headerText}</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Questions? <a href="mailto:${SUPPORT()}" style="color:${color};text-decoration:none;">${SUPPORT()}</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
              © ${new Date().getFullYear()} ${APP_NAME()}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── 1. Status o'zgarganda (premium/vip yoqildi yoki free qilindi) ─────────────
export function buildStatusChangedEmail(user: {
  name: string;
  status: string;
  statusExpiry?: Date | null;
}) {
  const color = STATUS_COLORS[user.status] || STATUS_COLORS.free;
  const label = user.status.charAt(0).toUpperCase() + user.status.slice(1);
  const expDate = user.statusExpiry
    ? new Date(user.statusExpiry).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const subject =
    user.status === "free"
      ? `Your subscription has ended — ${APP_NAME()}`
      : `🎉 Your ${label} subscription is now active — ${APP_NAME()}`;

  const bodyHtml =
    user.status === "free"
      ? `<p style="font-size:16px;color:#374151;">Hi <strong>${user.name}</strong>,</p>
         <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:16px 0;">
           Your subscription has ended and your account is now on the <strong>Free</strong> plan.
           You can still access all free content on our platform.
         </p>
         <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:16px 0;">
           Ready to upgrade? Renew your plan anytime to regain full access.
         </p>
         <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
           <tr><td align="center">
             <a href="${APP_URL()}/pricing"
               style="display:inline-block;background:${color};color:#fff;text-decoration:none;
                      padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;">
               View Plans
             </a>
           </td></tr>
         </table>`
      : `<p style="font-size:16px;color:#374151;">Hi <strong>${user.name}</strong>,</p>
         <p style="font-size:15px;color:#374151;line-height:1.6;margin:16px 0;">
           Your account has been upgraded to
           <strong style="color:${color};">${label}</strong>.
           You now have full access to all ${label} features.
         </p>
         ${
           expDate
             ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
               <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
                 <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
                   Active Until
                 </p>
                 <p style="margin:0;font-size:22px;font-weight:800;color:#111827;">${expDate}</p>
               </td></tr>
             </table>`
             : ""
         }
         <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
           <tr><td align="center">
             <a href="${APP_URL()}"
               style="display:inline-block;background:${color};color:#fff;text-decoration:none;
                      padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;">
               Go to Dashboard
             </a>
           </td></tr>
         </table>`;

  return {
    subject,
    html: baseLayout(color, "Account Status Update", bodyHtml),
  };
}

// ─── 2. Subscription tugashidan 1 kun oldin eslatma ───────────────────────────
export function buildExpiryReminderEmail(user: {
  name: string;
  status: string;
  statusExpiry: Date;
}) {
  const color = STATUS_COLORS[user.status] || STATUS_COLORS.premium;
  const label = user.status.charAt(0).toUpperCase() + user.status.slice(1);
  const expDate = new Date(user.statusExpiry).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `⏰ Your ${label} subscription expires tomorrow — ${APP_NAME()}`;

  const bodyHtml = `
    <p style="font-size:16px;color:#374151;">Hi <strong>${user.name}</strong>,</p>
    <p style="font-size:15px;color:#374151;line-height:1.6;margin:16px 0;">
      Just a heads-up — your <strong style="color:${color};">${label}</strong> subscription
      expires <strong>tomorrow</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
          Expires On
        </p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#ea580c;">${expDate}</p>
      </td></tr>
    </table>
    <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:16px 0;">
      After expiry your account will automatically switch to the Free plan.
      Renew now to keep uninterrupted access.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
      <tr><td align="center">
        <a href="${APP_URL()}/pricing"
          style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;
                 padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;">
          Renew Subscription
        </a>
      </td></tr>
    </table>`;

  return {
    subject,
    html: baseLayout(color, "Subscription Reminder", bodyHtml),
  };
}

// Test result yuborish funksiyasi
export async function sendTestResult(
  userEmail: string,
  testName: string,
  score: number,
  bandScore: number,
) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Your IELTS Mock Test Results - ${testName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">IELTS Mock Exam Results</h2>
          <p>Congratulations on completing <strong>${testName}</strong>!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Results:</h3>
            <p style="font-size: 18px;">
              <strong>Score:</strong> ${score} / 40<br>
              <strong>Band Score:</strong> ${bandScore}
            </p>
          </div>
          
          <p>Keep practicing to improve your score!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated email from IELTS Mock Exam platform.
            </p>
          </div>
        </div>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Email verification yuborish
export async function sendVerificationEmail(
  userEmail: string,
  verificationToken: string,
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/verify?token=${verificationToken}`;

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "Verify Your Email - IELTS Mock Exam",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Verification</h2>
          <p>Thank you for registering with IELTS Mock Exam!</p>
          <p>Please click the button below to verify your email address:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #2563eb; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
        </div>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
