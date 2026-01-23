import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TestReview } from "@/models/TestReview";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    // O'ZGARISH: testType ni ham qabul qilamiz
    const { userId, testId, testType, rating, comment, pageUrl } = body;

    if (!testId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar yetarli emas" },
        { status: 400 },
      );
    }

    const finalUserId = userId || "anonymous";

    // O'ZGARISH: testType ni bazaga yozamiz (agar kelmasa default "listening" beramiz)
    const newReview = await TestReview.create({
      userId: finalUserId,
      testId,
      testType: testType || "listening", // Fallback
      rating,
      comment,
      pageUrl,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Review saqlandi",
      data: newReview,
    });
  } catch (error) {
    console.error("REVIEW_SAVE_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Server xatosi" },
      { status: 500 },
    );
  }
}
export async function GET(req: Request) {
  try {
    await connectDB();

    // 1. Reviewlarni oddiy JSON holatida olamiz (.lean())
    // Bu yerda userId hali oddiy string bo'lib turibdi
    const reviews = await TestReview.find()
      .sort({ createdAt: -1 })
      .limit(9)
      .lean();

    // 2. Reviewlar ichidan barcha userId larni yig'ib olamiz
    const userIds = reviews.map((review: any) => review.userId).filter(Boolean);

    // 3. Shu ID larga tegishli Userlarni bazadan olamiz
    // Mongoose string ID larni avtomatik ObjectId ga aylantirib qidiradi
    const users = await User.find({ _id: { $in: userIds } })
      .select("name avatar")
      .lean();

    // 4. Userlarni ID bo'yicha tez topish uchun Map (lug'at) qilamiz
    // Masalan: { "64f8a...": { name: "Ali", avatar: "..." } }
    const userMap: Record<string, any> = {};
    users.forEach((user: any) => {
      userMap[user._id.toString()] = user;
    });

    // 5. Review va Userni birlashtiramiz
    const populatedReviews = reviews.map((review: any) => {
      // Review dagi userId stringini olamiz
      const uidString = review.userId?.toString();
      // UserMap dan shu ID ga mos userni topamiz
      const userDetail = userMap[uidString] || null;

      return {
        ...review,
        userId: userDetail, // Endi userId o'rnida to'liq user object turadi
      };
    });

    return NextResponse.json({
      success: true,
      data: populatedReviews,
    });
  } catch (error) {
    console.error("REVIEW_FETCH_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
