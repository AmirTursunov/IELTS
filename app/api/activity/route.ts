import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Listening } from "@/models/Listening";
import { User } from "@/models/User";
import { TestReview } from "@/models/TestReview";
import { Reading } from "@/models/Reading";
// import { Reading } from "@/models/Reading";

export async function GET() {
  try {
    await connectDB();

    // Limitni kattaroq qilamiz (masalan, oxirgi 100 ta harakat)
    const LIMIT = 100;

    const recentListening = await Listening.find()
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .select("testName createdAt")
      .lean();
    const recentReading = await Reading.find()
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .select("testName createdAt")
      .lean();
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .select("name email createdAt")
      .lean();
    const recentReviews = await TestReview.find()
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .populate("userId", "name")
      .lean();

    const activities = [
      ...recentListening.map((item: any) => ({
        _id: item._id,
        type: "test",
        action: "New Listening Test",
        subject: item.testName,
        createdAt: item.createdAt,
      })),
      ...recentReading.map((item: any) => ({
        _id: item._id,
        type: "test",
        action: "New Reading Test",
        subject: item.testName,
        createdAt: item.createdAt,
      })),
      ...recentUsers.map((item: any) => ({
        _id: item._id,
        type: "user",
        action: "New User Registered",
        subject: item.name || item.email,
        createdAt: item.createdAt,
      })),
      ...recentReviews.map((item: any) => ({
        _id: item._id,
        type: "review",
        action: "New Review Submitted",
        subject: item.userId?.name || "Anonymous",
        createdAt: item.createdAt,
      })),
    ];

    // Saralash
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      data: activities, // Hammasini qaytaramiz
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
