// app/api/cron/subscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  buildExpiryReminderEmail,
  buildStatusChangedEmail,
  sendEmail,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  let reminded = 0;
  let expired = 0;
  const errors: string[] = [];

  // 1. Ertaga tugaydiganlar — eslatma
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const expiringSoon = await User.find({
    status: { $in: ["premium", "vip"] },
    statusExpiry: { $gte: tomorrowStart, $lte: tomorrowEnd },
  }).select("name email status statusExpiry");

  for (const user of expiringSoon) {
    try {
      const { subject, html } = buildExpiryReminderEmail({
        name: user.name,
        status: user.status,
        statusExpiry: user.statusExpiry!,
      });
      await sendEmail(user.email, subject, html);
      reminded++;
    } catch (err: any) {
      errors.push(`reminder:${user.email}:${err.message}`);
    }
  }

  // 2. Muddati o'tganlar — free qilish + email
  const expired_users = await User.find({
    status: { $in: ["premium", "vip"] },
    statusExpiry: { $lt: now },
  }).select("name email status statusExpiry");

  for (const user of expired_users) {
    try {
      user.status = "free";
      user.statusExpiry = null;
      await user.save();

      const { subject, html } = buildStatusChangedEmail({
        name: user.name,
        status: "free",
        statusExpiry: null,
      });
      await sendEmail(user.email, subject, html);
      expired++;
    } catch (err: any) {
      errors.push(`expire:${user.email}:${err.message}`);
    }
  }

  // Minimal response — faqat raqamlar
  return NextResponse.json({
    ok: true,
    reminded,
    expired,
    errors: errors.length > 0 ? errors : undefined,
  });
}
