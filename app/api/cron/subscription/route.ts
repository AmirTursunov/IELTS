// app/api/cron/subscription/route.ts
//
// Vercel Cron yoki tashqi cron service (cron-job.org) orqali har kuni chaqiriladi.
// vercel.json da:
//   { "crons": [{ "path": "/api/cron/subscription", "schedule": "0 6 * * *" }] }
//
// So'rovda CRON_SECRET header tekshiriladi — ruxsatsiz kirishni bloklaydi.

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  buildExpiryReminderEmail,
  buildStatusChangedEmail,
  sendEmail,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  // ── Auth: CRON_SECRET tekshiruvi ──────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();

  // ── 1. Eslatma: ertaga tugaydiganlar ─────────────────────────────────────
  // statusExpiry holati: bugun + 24 soat oralig'idagilar
  const reminderStart = new Date(now);
  reminderStart.setHours(0, 0, 0, 0);
  reminderStart.setDate(reminderStart.getDate() + 1); // ertaning boshlanishi

  const reminderEnd = new Date(reminderStart);
  reminderEnd.setHours(23, 59, 59, 999); // ertaning oxiri

  const expiringSoon = await User.find({
    status: { $in: ["premium", "vip"] },
    statusExpiry: { $gte: reminderStart, $lte: reminderEnd },
  }).select("name email status statusExpiry");

  let remindedCount = 0;
  for (const user of expiringSoon) {
    try {
      const { subject, html } = buildExpiryReminderEmail({
        name: user.name,
        status: user.status,
        statusExpiry: user.statusExpiry!,
      });
      await sendEmail(user.email, subject, html);
      remindedCount++;
      console.log(`[CRON] Reminder sent → ${user.email}`);
    } catch (err) {
      console.error(`[CRON] Reminder failed → ${user.email}:`, err);
    }
  }

  // ── 2. Expiry: muddati o'tganlarni free qilish ────────────────────────────
  const expired = await User.find({
    status: { $in: ["premium", "vip"] },
    statusExpiry: { $lt: now },
  }).select("name email status statusExpiry");

  let expiredCount = 0;
  for (const user of expired) {
    try {
      // Status'ni free qilish
      user.status = "free";
      user.statusExpiry = null;
      await user.save();

      // Email yuborish
      const { subject, html } = buildStatusChangedEmail({
        name: user.name,
        status: "free",
        statusExpiry: null,
      });
      await sendEmail(user.email, subject, html);
      expiredCount++;
      console.log(`[CRON] Expired & notified → ${user.email}`);
    } catch (err) {
      console.error(`[CRON] Expire failed → ${user.email}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    reminded: remindedCount,
    expired: expiredCount,
    ranAt: now.toISOString(),
  });
}
