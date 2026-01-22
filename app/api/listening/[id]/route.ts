import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Listening } from "@/models/Listening";

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

    const test = await Listening.findById(id).lean().exec();

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    const sanitizedTest = {
      ...test,
      _id: test._id.toString(),
      sections: test.sections.map((section: any) => ({
        ...section,
        questions: section.questions.map((q: any) => ({
          questionNumber: q.questionNumber,
          questionType: q.questionType,
          contextText: q.contextText || "",
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          points: q.points || 1,
          imageUrl: q.imageUrl || null, // ✅ ADD THIS LINE
        })),
      })),
    };

    return NextResponse.json({ success: true, data: sanitizedTest });
  } catch (error: any) {
    console.error("GET listening test error:", error);
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

    const sanitizedBody = {
      ...body,
      sections: body.sections.map((section: any) => ({
        ...section,
        questions: section.questions.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer || "",
        })),
      })),
    };

    const test = await Listening.findByIdAndUpdate(id, sanitizedBody, {
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
    console.error("PUT listening test error:", error);
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

    const test = await Listening.findByIdAndDelete(id);

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error("DELETE listening test error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
