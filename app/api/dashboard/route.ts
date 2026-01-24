import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Listening } from "@/models/Listening";
import { Reading } from "@/models/Reading"; // <--- YANGI IMPORT
import { User } from "@/models/User";
import { TestReview } from "@/models/TestReview";

export async function GET() {
  try {
    await connectDB();

    let recentListening: any[] = [];
    let recentReading: any[] = []; // <--- YANGI
    let recentUsers: any[] = [];
    let recentReviews: any[] = [];

    let listeningCount = 0;
    let readingCount = 0; // <--- YANGI

    // 1. Listening Data
    try {
      recentListening = await Listening.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("testName createdAt")
        .lean();
      listeningCount = await Listening.countDocuments();
    } catch (e) {
      console.log("Listening fetch error", e);
    }

    // 2. Reading Data (YANGI QO'SHILDI)
    try {
      // Agar Reading modelida 'testName' emas 'title' bo'lsa, uni 'testName' ga o'giramiz
      recentReading = await Reading.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt")
        .lean();
      readingCount = await Reading.countDocuments();
    } catch (e) {
      console.log("Reading fetch error", e);
    }

    // 3. User Data
    try {
      recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt")
        .lean();
    } catch (e) {
      console.log("User fetch error", e);
    }

    // 4. Review Data
    try {
      recentReviews = await TestReview.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name")
        .lean();
    } catch (e) {
      console.log("Review fetch error", e);
    }

    // Barchasini bitta arrayga yig'amiz
    const activities = [
      // Listening
      ...(recentListening || []).map((item: any) => ({
        type: "test",
        action: "New Listening Test",
        subject: item.testName || "Untitled Listening",
        createdAt: item.createdAt,
      })),
      // Reading (YANGI)
      ...(recentReading || []).map((item: any) => ({
        type: "test", // Yoki ajratish uchun "reading-test" deyish mumkin, lekin icon uchun "test" qolgani ma'qul
        action: "New Reading Test",
        subject: item.title || "Untitled Reading", // Reading modelida 'title' bo'lsa kerak
        createdAt: item.createdAt,
      })),
      // Users
      ...(recentUsers || []).map((item: any) => ({
        type: "user",
        action: "New User Registered",
        subject: item.name || item.email || "User",
        createdAt: item.createdAt,
      })),
      // Reviews
      ...(recentReviews || []).map((item: any) => ({
        type: "review",
        action: "New Review Submitted",
        subject: item.userId?.name || "Anonymous",
        createdAt: item.createdAt,
      })),
    ];

    // Sanasi bo'yicha eng yangisini tepaga chiqaramiz
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const stats = {
      totalTests: listeningCount + readingCount, // Umumiy soni
      totalListeningTests: listeningCount,
      totalReadingTests: readingCount, // Reading soni
    };

    return NextResponse.json({
      success: true,
      stats,
      activities: activities.slice(0, 10), // Faqat oxirgi 10 tasi
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({
      success: false,
      stats: { totalTests: 0, totalListeningTests: 0, totalReadingTests: 0 },
      activities: [],
    });
  }
}
