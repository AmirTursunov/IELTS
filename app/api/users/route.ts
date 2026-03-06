import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserTestResult } from "@/models/UserTestResult"; //

export async function GET() {
  try {
    await connectDB();

    // 1. Barcha oddiy userlarni olamiz (adminlarni keragi yo'q)
    const users = await User.find({ role: "user" })
      .select("name email status createdAt") // Faqat kerakli maydonlar
      .sort({ createdAt: -1 })
      .lean();

    // 2. UserTestResult dan hamma userlarning statistikasini bitta so'rovda olamiz (Aggregation)
    const stats = await UserTestResult.aggregate([
      {
        $group: {
          _id: "$userId", // userId bo'yicha guruhlash
          totalTests: { $sum: 1 }, // Testlar soni
          avgScore: { $avg: "$bandScore" }, // O'rtacha band score
        },
      },
    ]);

    // 3. Statistikani qidirish oson bo'lishi uchun Map (Object) ga aylantiramiz
    // Masalan: { "user_id_1": { count: 5, avg: 7.5 }, ... }
    const statsMap: Record<string, any> = {};
    stats.forEach((stat) => {
      statsMap[stat._id] = stat;
    });

    // 4. User ma'lumotlari va statistikani birlashtiramiz
    const data = users.map((user: any) => {
      const userStat = statsMap[user._id.toString()] || {
        totalTests: 0,
        avgScore: 0,
      };

      return {
        _id: user._id,
        name: user.name || "No Name",
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
        tests: userStat.totalTests, // Real testlar soni
        score: userStat.avgScore > 0 ? userStat.avgScore.toFixed(1) : "-", // Real o'rtacha ball
      };
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
