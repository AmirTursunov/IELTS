// app/api/user/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

/* =======================
   TYPE DEFINITIONS
======================= */

type TestType = "reading" | "listening" | "speaking" | "writing";

interface TestHistoryItem {
  testId: string;
  testType: TestType;
  score: number;
  bandScore: number;
  completedAt: string | Date;
}

interface PerformanceByType {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}

interface TestCounts {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}

interface StatsResponse {
  success: boolean;
  data?: {
    stats: {
      totalTests: number;
      averageBand: number;
      studyStreak: number;
      hoursStudied: number;
    };
    recentTests: {
      id: string;
      type: TestType;
      score: number;
      bandScore: number;
      date: string | Date;
    }[];
    performanceByType: PerformanceByType;
    user: {
      name: string;
      email: string;
      avatar?: string;
      role: string;
      joinedAt: Date;
    };
  };
  error?: string;
}

/* =======================
   API HANDLER
======================= */

export async function GET(
  request: NextRequest,
): Promise<NextResponse<StatsResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).lean<{
      name: string;
      email: string;
      avatar?: string;
      role: string;
      createdAt: Date;
      testHistory?: TestHistoryItem[];
    }>();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    /* =======================
       CALCULATIONS
    ======================= */

    const testHistory: TestHistoryItem[] = user.testHistory ?? [];

    const totalTests: number = testHistory.length;

    const averageBand: number =
      totalTests > 0
        ? Number(
            (
              testHistory.reduce(
                (sum: number, test: TestHistoryItem) => sum + test.bandScore,
                0,
              ) / totalTests
            ).toFixed(1),
          )
        : 0;

    // Mock values (keyinchalik real implementation)
    const studyStreak: number = 15;
    const hoursStudied: number = totalTests * 2;

    /* =======================
       RECENT TESTS
    ======================= */

    const recentTests = [...testHistory]
      .sort(
        (a: TestHistoryItem, b: TestHistoryItem) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )
      .slice(0, 5)
      .map((test: TestHistoryItem) => ({
        id: test.testId,
        type: test.testType,
        score: test.score,
        bandScore: test.bandScore,
        date: test.completedAt,
      }));

    /* =======================
       PERFORMANCE BY TYPE
    ======================= */

    const performanceByType: PerformanceByType = {
      reading: 0,
      listening: 0,
      speaking: 0,
      writing: 0,
    };

    const testCounts: TestCounts = {
      reading: 0,
      listening: 0,
      speaking: 0,
      writing: 0,
    };

    testHistory.forEach((test: TestHistoryItem) => {
      performanceByType[test.testType] += test.bandScore;
      testCounts[test.testType]++;
    });

    (Object.keys(performanceByType) as TestType[]).forEach((type: TestType) => {
      if (testCounts[type] > 0) {
        performanceByType[type] = Number(
          (performanceByType[type] / testCounts[type]).toFixed(1),
        );
      }
    });

    /* =======================
       RESPONSE
    ======================= */

    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            totalTests,
            averageBand,
            studyStreak,
            hoursStudied,
          },
          recentTests,
          performanceByType,
          user: {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            joinedAt: user.createdAt,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      { status: 500 },
    );
  }
}
