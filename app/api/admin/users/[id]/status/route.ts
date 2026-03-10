// app/api/admin/users/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { buildStatusChangedEmail, sendEmail } from "@/lib/email";

export async function PATCH(
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
    const { status, duration } = body;

    if (!status || !["free", "premium", "vip"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // ── Status update ──────────────────────────────────────────────────────
    user.status = status;

    if (status === "free") {
      user.statusExpiry = null;
    } else if (duration && duration > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + duration);
      user.statusExpiry = expiryDate;
    }

    await user.save();

    // ── Auto email — fire & forget (admin kutmasin) ────────────────────────
    if (user.email) {
      const { subject, html } = buildStatusChangedEmail({
        name: user.name,
        status: user.status,
        statusExpiry: user.statusExpiry,
      });
      sendEmail(user.email, subject, html).catch((err) =>
        console.error("[status] Email failed:", err),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: {
        id: user._id,
        status: user.status,
        statusExpiry: user.statusExpiry,
      },
    });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 },
    );
  }
}
