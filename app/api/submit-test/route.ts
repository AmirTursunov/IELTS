// app/api/submit-test/route.ts
// ⚠️ Bu fayl APP/API/SUBMIT-TEST/ papkasida bo'lishi kerak!

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reading } from "@/models/Reading";
import { Listening } from "@/models/Listening";
import { UserTestResult } from "@/models/UserTestResult";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to calculate IELTS band score
function calculateBandScore(correctAnswers: number): number {
  if (correctAnswers >= 39) return 9.0;
  if (correctAnswers >= 37) return 8.5;
  if (correctAnswers >= 35) return 8.0;
  if (correctAnswers >= 32) return 7.5;
  if (correctAnswers >= 30) return 7.0;
  if (correctAnswers >= 26) return 6.5;
  if (correctAnswers >= 23) return 6.0;
  if (correctAnswers >= 18) return 5.5;
  if (correctAnswers >= 16) return 5.0;
  if (correctAnswers >= 13) return 4.5;
  if (correctAnswers >= 10) return 4.0;
  if (correctAnswers >= 7) return 3.5;
  if (correctAnswers >= 5) return 3.0;
  if (correctAnswers >= 3) return 2.5;
  if (correctAnswers >= 1) return 2.0;
  return 1.0;
}

export async function POST(req: NextRequest) {
  console.log("\n" + "=".repeat(70));
  console.log("🔥 TEST SUBMIT API CALLED");
  console.log("=".repeat(70));

  try {
    // Step 1: Connect to MongoDB
    console.log("📡 Step 1: Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    // Step 2: Get session
    console.log("\n📡 Step 2: Getting user session...");
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("❌ NO SESSION FOUND!");
      console.error("Session:", session);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("✅ Session found:");
    console.log("   User ID:", userId);
    console.log("   User Email:", session.user.email);
    console.log("   User Name:", session.user.name);

    // Step 3: Parse request body
    console.log("\n📡 Step 3: Parsing request body...");
    const body = await req.json();
    console.log("✅ Body received:");
    console.log("   Keys:", Object.keys(body));

    const { testId, answers, timeSpent, testType } = body;

    console.log("\n📋 Test Details:");
    console.log("   Test ID:", testId);
    console.log("   Test Type:", testType);
    console.log("   Answers Count:", answers?.length);
    console.log("   Time Spent:", timeSpent, "seconds");

    // Validation
    if (!testId || !testType || !answers) {
      console.error("❌ Missing required fields!");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 4: Fetch test from database
    console.log("\n📡 Step 4: Fetching test from database...");
    let test;

    if (testType === "reading") {
      test = await Reading.findById(testId).lean();
      console.log("📖 Reading test:", test ? "FOUND ✅" : "NOT FOUND ❌");
    } else if (testType === "listening") {
      test = await Listening.findById(testId).lean();
      console.log("🎧 Listening test:", test ? "FOUND ✅" : "NOT FOUND ❌");
    } else {
      console.error("❌ Invalid test type:", testType);
      return NextResponse.json(
        { success: false, error: "Invalid test type" },
        { status: 400 }
      );
    }

    if (!test) {
      console.error("❌ Test not found in database!");
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    console.log("✅ Test loaded successfully");
    console.log("   Test title:", test.title);

    // Step 5: Extract questions
    console.log("\n📡 Step 5: Extracting questions...");
    const allQuestions =
      testType === "reading"
        ? test.passages.flatMap((p: any) => p.questions)
        : test.sections.flatMap((s: any) => s.questions);

    console.log("✅ Questions extracted:", allQuestions.length);

    // Step 6: Grade answers
    console.log("\n📡 Step 6: Grading answers...");
    const gradedAnswers = answers.map((userAnswer: any) => {
      const question = allQuestions.find(
        (q: any) => q.questionNumber === userAnswer.questionNumber
      );

      if (!question) {
        console.warn(
          `⚠️ Question ${userAnswer.questionNumber} not found in test`
        );
        return { ...userAnswer, isCorrect: false, points: 0 };
      }

      // Handle correctAnswer comparison
      let isCorrect = false;
      const correctAnswer = question.correctAnswer;
      const userAns = userAnswer.userAnswer;

      if (Array.isArray(correctAnswer)) {
        // If multiple correct answers
        isCorrect = correctAnswer.some(
          (ans: string) =>
            ans.toLowerCase().trim() === userAns.toLowerCase().trim()
        );
      } else {
        // Single correct answer
        isCorrect =
          correctAnswer.toLowerCase().trim() === userAns.toLowerCase().trim();
      }

      return {
        questionNumber: userAnswer.questionNumber,
        userAnswer: userAns,
        correctAnswer: Array.isArray(correctAnswer)
          ? correctAnswer[0]
          : correctAnswer,
        isCorrect,
        points: isCorrect ? question.points || 1 : 0,
      };
    });

    const totalScore = gradedAnswers.reduce(
      (sum: number, a: any) => sum + a.points,
      0
    );
    const maxScore = allQuestions.reduce(
      (sum: number, q: any) => sum + (q.points || 1),
      0
    );
    const correctAnswers = gradedAnswers.filter((a: any) => a.isCorrect).length;
    const bandScore = calculateBandScore(correctAnswers);

    console.log("✅ Grading complete:");
    console.log("   Correct:", correctAnswers, "/", allQuestions.length);
    console.log("   Score:", totalScore, "/", maxScore);
    console.log(
      "   Percentage:",
      ((correctAnswers / allQuestions.length) * 100).toFixed(2) + "%"
    );
    console.log("   Band Score:", bandScore);

    // Step 7: Save to UserTestResult (if model exists)
    console.log("\n📡 Step 7: Saving to UserTestResult collection...");
    try {
      const result = await UserTestResult.create({
        userId,
        testId,
        testType,
        answers: gradedAnswers,
        totalScore,
        maxScore,
        bandScore,
        timeSpent,
      });
      console.log("✅ Result saved to UserTestResult:");
      console.log("   Result ID:", result._id);
    } catch (resultError: any) {
      console.warn("⚠️ Could not save to UserTestResult:", resultError.message);
      console.warn("   Continuing without UserTestResult...");
    }

    // Step 8: Update User testHistory
    console.log("\n📡 Step 8: Updating User testHistory...");
    console.log("   User ID to update:", userId);

    const updateData = {
      testId: testId,
      testType: testType,
      score: totalScore,
      bandScore: bandScore,
      completedAt: new Date(),
    };

    console.log("   Data to push:", JSON.stringify(updateData, null, 2));

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            testHistory: updateData,
          },
        },
        { new: true, runValidators: false }
      );

      if (updatedUser) {
        console.log(
          "✅ ✅ ✅ USER TEST HISTORY UPDATED SUCCESSFULLY! ✅ ✅ ✅"
        );
        console.log(
          "   New testHistory length:",
          updatedUser.testHistory?.length || 0
        );
      } else {
        console.error("❌ Update returned null - user might not exist");
      }
    } catch (updateError: any) {
      console.error("❌ ❌ ❌ FAILED TO UPDATE USER HISTORY! ❌ ❌ ❌");
      console.error("Error message:", updateError.message);
    }

    // Step 9: Return response
    console.log("\n📡 Step 9: Preparing response...");
    const responseData = {
      success: true,
      data: {
        resultId: `result_${Date.now()}`,
        correctAnswers,
        totalQuestions: allQuestions.length,
        totalScore,
        maxScore,
        percentage: ((correctAnswers / allQuestions.length) * 100).toFixed(2),
        bandScore,
        gradedAnswers,
      },
    };

    console.log("=".repeat(70));
    console.log("✅ ✅ ✅ TEST SUBMIT SUCCESSFUL! ✅ ✅ ✅");
    console.log("=".repeat(70));
    console.log("Response summary:");
    console.log("   Band Score:", bandScore);
    console.log(
      "   Correct Answers:",
      correctAnswers + "/" + allQuestions.length
    );
    console.log("=".repeat(70) + "\n");

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ ❌ ❌ FATAL ERROR IN TEST SUBMIT! ❌ ❌ ❌");
    console.error("=".repeat(70));
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=".repeat(70) + "\n");

    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit test" },
      { status: 500 }
    );
  }
}
