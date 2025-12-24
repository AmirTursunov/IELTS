// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("📧 Forgot password request for:", email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected");

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("👤 User found:", user ? "Yes" : "No");

    // Security: Always return success even if user doesn't exist
    if (!user) {
      console.log("⚠️ User not found, returning success for security");
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists, a reset link has been sent",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("🔑 Reset token generated");

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    console.log("💾 Token saved to database");

    // Create reset URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    console.log("🔗 Reset URL:", resetUrl);

    // Check if email is configured
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.log("⚠️ Email not configured, returning mock success");
      console.log("Reset link (for development):", resetUrl);

      return NextResponse.json(
        {
          success: true,
          message: "Password reset link sent to your email",
          // Only in development
          devResetUrl:
            process.env.NODE_ENV === "development" ? resetUrl : undefined,
        },
        { status: 200 }
      );
    }

    // Send email with nodemailer
    try {
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log("📮 Sending email...");

      await transporter.sendMail({
        from: `"IELTS Platform" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #06b6d4, #2563eb); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #06b6d4, #2563eb); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
              .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>We received a request to reset your password for your IELTS Platform account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <div class="warning">
                  <p><strong>⚠️ Security Notice:</strong></p>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                  </ul>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} IELTS Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("✅ Email sent successfully");
    } catch (emailError: any) {
      console.error("❌ Email error:", emailError.message);
      // Don't fail the request if email fails
      return NextResponse.json(
        {
          success: true,
          message: "Password reset link sent to your email",
          devResetUrl:
            process.env.NODE_ENV === "development" ? resetUrl : undefined,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset link sent to your email",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Forgot password error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
