// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    console.log("🏆 Fetching leaderboard data...");

    // Get all users with at least 3 tests
    const leaderboard = await User.aggregate([
      // Filter: Users with at least 3 tests
      {
        $match: {
          "testHistory.2": { $exists: true }, // Has at least 3 items in array
        },
      },

      // Calculate statistics
      {
        $addFields: {
          totalTests: { $size: "$testHistory" },
          avgBand: {
            $round: [{ $avg: "$testHistory.bandScore" }, 1],
          },
          lastTestDate: { $max: "$testHistory.completedAt" },

          // Calculate best scores per type
          readingTests: {
            $filter: {
              input: "$testHistory",
              as: "test",
              cond: { $eq: ["$$test.testType", "reading"] },
            },
          },
          listeningTests: {
            $filter: {
              input: "$testHistory",
              as: "test",
              cond: { $eq: ["$$test.testType", "listening"] },
            },
          },
        },
      },

      // Calculate best scores
      {
        $addFields: {
          bestReading: {
            $cond: {
              if: { $gt: [{ $size: "$readingTests" }, 0] },
              then: { $max: "$readingTests.bandScore" },
              else: 0,
            },
          },
          bestListening: {
            $cond: {
              if: { $gt: [{ $size: "$listeningTests" }, 0] },
              then: { $max: "$listeningTests.bandScore" },
              else: 0,
            },
          },
        },
      },

      // Sort: Average band DESC, then total tests DESC, then recent first
      {
        $sort: {
          avgBand: -1,
          totalTests: -1,
          lastTestDate: -1,
        },
      },

      // Top 100 users
      { $limit: 100 },

      // Select only needed fields
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          avgBand: 1,
          totalTests: 1,
          lastTestDate: 1,
          bestReading: 1,
          bestListening: 1,
        },
      },
    ]);

    console.log(`✅ Found ${leaderboard.length} users for leaderboard`);

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        totalUsers: leaderboard.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Leaderboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
      },
      { status: 500 }
    );
  }
}
