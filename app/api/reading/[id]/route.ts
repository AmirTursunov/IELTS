import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reading } from "@/models/Reading";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, error: "Invalid test ID" },
        { status: 400 }
      );
    }

    // CRITICAL: Use .lean() to get plain JavaScript object
    const test = await Reading.findById(id).lean().exec();

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    // Convert MongoDB _id to string and ensure correctAnswer is included
    const sanitizedTest = {
      ...test,
      _id: test._id.toString(),
      passages: test.passages.map((passage: any) => ({
        ...passage,
        questions: passage.questions.map((q: any) => ({
          questionNumber: q.questionNumber,
          questionType: q.questionType,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          points: q.points || 1,
        })),
      })),
    };

    console.log(
      "GET Test - Full test data:",
      JSON.stringify(sanitizedTest, null, 2)
    );

    return NextResponse.json({ success: true, data: sanitizedTest });
  } catch (error: any) {
    console.error("GET reading test error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, error: "Invalid test ID" },
        { status: 400 }
      );
    }

    // Ensure correctAnswer is properly formatted
    const sanitizedBody = {
      ...body,
      passages: body.passages.map((passage: any) => ({
        ...passage,
        questions: passage.questions.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer || "",
        })),
      })),
    };

    const test = await Reading.findByIdAndUpdate(id, sanitizedBody, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    console.error("PUT reading test error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, error: "Invalid test ID" },
        { status: 400 }
      );
    }

    const test = await Reading.findByIdAndDelete(id);

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error("DELETE reading test error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
