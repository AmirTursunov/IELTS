import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reading } from "@/models/Reading";
import { Listening } from "@/models/Listening";
import { UserTestResult } from "@/models/UserTestResult";

// Helper function to calculate IELTS band score
function calculateBandScore(
  correctAnswers: number,
  totalQuestions: number,
  testType: string
): number {
  const percentage = (correctAnswers / totalQuestions) * 100;

  // IELTS Reading/Listening band score mapping (approximate)
  if (percentage >= 90) return 9.0;
  if (percentage >= 82) return 8.5;
  if (percentage >= 75) return 8.0;
  if (percentage >= 67) return 7.5;
  if (percentage >= 60) return 7.0;
  if (percentage >= 52) return 6.5;
  if (percentage >= 45) return 6.0;
  if (percentage >= 37) return 5.5;
  if (percentage >= 30) return 5.0;
  if (percentage >= 22) return 4.5;
  if (percentage >= 15) return 4.0;
  return 3.5;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, testId, testType, answers, timeSpent } = await req.json();

    let test;
    if (testType === "reading") {
      test = await Reading.findById(testId);
    } else {
      test = await Listening.findById(testId);
    }

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    // Get all questions with correct answers
    const allQuestions =
      testType === "reading"
        ? test.passages.flatMap((p: any) => p.questions)
        : test.sections.flatMap((s: any) => s.questions);

    // Grade the answers
    const gradedAnswers = answers.map((userAnswer: any) => {
      const question = allQuestions.find(
        (q: any) => q.questionNumber === userAnswer.questionNumber
      );
      if (!question) return { ...userAnswer, isCorrect: false, points: 0 };

      const isCorrect =
        JSON.stringify(question.correctAnswer) ===
        JSON.stringify(userAnswer.userAnswer);

      return {
        questionNumber: userAnswer.questionNumber,
        userAnswer: userAnswer.userAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      };
    });

    const totalScore = gradedAnswers.reduce(
      (sum: number, a: any) => sum + a.points,
      0
    );
    const maxScore = allQuestions.reduce(
      (sum: number, q: any) => sum + q.points,
      0
    );
    const correctAnswers = gradedAnswers.filter((a: any) => a.isCorrect).length;
    const bandScore = calculateBandScore(
      correctAnswers,
      allQuestions.length,
      testType
    );

    // Save result
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

    return NextResponse.json({
      success: true,
      data: {
        result,
        correctAnswers,
        totalQuestions: allQuestions.length,
        percentage: ((correctAnswers / allQuestions.length) * 100).toFixed(2),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
