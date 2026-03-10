// app/api/admin/users/[id]/notify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import nodemailer from "nodemailer";

// ─── Email transporter ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Email templates ─────────────────────────────────────────────────────────
const getEmailContent = (
  type: string,
  user: { name: string; status: string; statusExpiry?: Date | null },
) => {
  const appName = process.env.APP_NAME || "IELTS Platform";
  const appUrl = process.env.NEXTAUTH_URL || "https://yoursite.com";

  const expDate = user.statusExpiry
    ? new Date(user.statusExpiry).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const statusColors: Record<string, string> = {
    vip: "#7c3aed",
    premium: "#2563eb",
    free: "#6b7280",
  };
  const color = statusColors[user.status] || statusColors.free;
  const statusLabel =
    user.status.charAt(0).toUpperCase() + user.status.slice(1);

  if (type === "status") {
    const subject =
      user.status === "free"
        ? `Your subscription has ended — ${appName}`
        : `🎉 Your ${statusLabel} subscription is active — ${appName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${color};padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                ${appName}
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Account Status Update
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">
                Hi <strong>${user.name}</strong>,
              </p>

              ${
                user.status === "free"
                  ? `
              <p style="margin:16px 0;font-size:15px;color:#6b7280;line-height:1.6;">
                Your subscription has ended and your account has been moved to the <strong>Free</strong> plan.
                You can still access free content on our platform.
              </p>
              <p style="margin:16px 0;font-size:15px;color:#6b7280;line-height:1.6;">
                To continue enjoying premium features, upgrade your plan anytime.
              </p>
              `
                  : `
              <p style="margin:16px 0;font-size:15px;color:#374151;line-height:1.6;">
                Your account has been upgraded to
                <strong style="color:${color};">${statusLabel}</strong>.
                You now have full access to all ${statusLabel} features.
              </p>
              ${
                expDate
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">
                      Subscription Active Until
                    </p>
                    <p style="margin:0;font-size:22px;font-weight:800;color:#111827;">
                      ${expDate}
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
              `
              }

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}"
                      style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;
                             padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Questions? Contact us at
                <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}"
                   style="color:${color};text-decoration:none;">
                  ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}
                </a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, html };
  }

  return {
    subject: `Notification from ${appName}`,
    html: `<p>Hi ${user.name}, this is a notification from ${appName}.</p>`,
  };
};

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { type = "status" } = body;

    await connectDB();

    const user = await User.findById(id).select(
      "name email status statusExpiry",
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "User has no email" },
        { status: 400 },
      );
    }

    const { subject, html } = getEmailContent(type, {
      name: user.name,
      status: user.status,
      statusExpiry: user.statusExpiry,
    });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME || "IELTS Platform"}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error: any) {
    console.error("Notify error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
