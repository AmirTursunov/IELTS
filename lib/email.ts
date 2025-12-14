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

// Test result yuborish funksiyasi
export async function sendTestResult(
  userEmail: string,
  testName: string,
  score: number,
  bandScore: number
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
  verificationToken: string
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
