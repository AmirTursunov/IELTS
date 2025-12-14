// app/api/send-result/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendTestResult } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { userEmail, testName, score, bandScore } = await req.json();

    // Validation
    if (
      !userEmail ||
      !testName ||
      score === undefined ||
      bandScore === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email yuborish
    const result = await sendTestResult(userEmail, testName, score, bandScore);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
