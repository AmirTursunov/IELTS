// app/api/user/send-password-change-notification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(
      "📧 Sending password change notification to:",
      session.user.email
    );

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Change password URL
    const changePasswordUrl = `${process.env.NEXTAUTH_URL}/dashboard/change-password`;

    // Check email configuration
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.log("⚠️ Email not configured");
      return NextResponse.json(
        {
          success: true,
          message: "Email notification skipped (dev mode)",
        },
        { status: 200 }
      );
    }

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"IELTS Platform Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 Password Change Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f7fafc; 
              margin: 0; 
              padding: 0; 
            }
            .container { 
              max-width: 600px; 
              margin: 30px auto; 
              background: white; 
              border-radius: 16px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header-icon {
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            .header h1 { 
              color: white; 
              margin: 0; 
              font-size: 28px;
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 40px; 
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
              color: white !important; 
              text-decoration: none; 
              border-radius: 12px; 
              font-weight: bold; 
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              transition: all 0.3s ease;
            }
            .button:hover { 
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
              transform: translateY(-2px);
            }
            .warning-box { 
              background: #fef2f2; 
              border-left: 4px solid #ef4444; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 8px; 
            }
            .warning-title { 
              color: #991b1b; 
              font-weight: bold; 
              margin-bottom: 12px; 
              display: flex; 
              align-items: center; 
              gap: 8px;
              font-size: 15px;
            }
            .warning-text {
              color: #7f1d1d;
              font-size: 14px;
              margin: 8px 0;
              padding-left: 24px;
            }
            .info-box {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .info-text {
              color: #1e40af;
              font-size: 14px;
              margin: 8px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px; 
              background: #f9fafb; 
              color: #6b7280; 
              font-size: 14px; 
              border-top: 1px solid #e5e7eb; 
            }
            .footer strong {
              color: #374151;
            }
            .footer a { 
              color: #3b82f6; 
              text-decoration: none; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">🔐</div>
              <h1>Password Change Request</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello <strong>${user.name}</strong>,
              </div>
              
              <div class="message">
                We received a request to change your password for your IELTS Platform account. 
                If you initiated this request, please click the button below to proceed with changing your password.
              </div>
              
              <div class="button-container">
                <a href="${changePasswordUrl}" class="button">
                  Change Password
                </a>
              </div>
              
              <div class="info-box">
                <div class="info-text">
                  <strong>📌 What happens next:</strong>
                </div>
                <div class="info-text">
                  • You'll be taken to a secure page to set your new password
                </div>
                <div class="info-text">
                  • You'll need to enter your current password for verification
                </div>
                <div class="info-text">
                  • Your new password must be at least 6 characters long
                </div>
              </div>
              
              <div class="warning-box">
                <div class="warning-title">
                  <span>⚠️</span>
                  <span>Security Notice</span>
                </div>
                <div class="warning-text">
                  <strong>Didn't request this?</strong> If you did not initiate this password change, 
                  please ignore this email and ensure your account is secure. Your current password 
                  will remain unchanged.
                </div>
                <div class="warning-text">
                  We recommend changing your password immediately if you suspect unauthorized access 
                  to your account.
                </div>
              </div>
              
              <div class="message" style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:
                <br>
                <a href="${changePasswordUrl}" style="color: #3b82f6; word-break: break-all;">
                  ${changePasswordUrl}
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 10px 0;">
                <strong>IELTS Platform</strong> - Your Path to Success
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} IELTS Platform. All rights reserved.
              </p>
              <p style="margin: 15px 0 0 0;">
                Questions? <a href="mailto:${
                  process.env.EMAIL_USER
                }">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Notification email sent successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Notification email sent",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Send notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
