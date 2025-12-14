import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reading } from "@/models/Reading";

// GET - Get all reading tests or filter
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const difficulty = searchParams.get("difficulty");
    const testType = searchParams.get("testType");

    const filter: any = {};
    if (difficulty) filter.difficulty = difficulty;
    if (testType) filter.testType = testType;

    const tests = await Reading.find(filter).select(
      "-passages.questions.correctAnswer"
    );

    return NextResponse.json({ success: true, data: tests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new reading test
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const test = await Reading.create(body);

    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
