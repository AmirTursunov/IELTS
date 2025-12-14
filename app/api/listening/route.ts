import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Listening } from "@/models/Listening";

// GET - Get all listening tests
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const difficulty = searchParams.get("difficulty");

    const filter: any = {};
    if (difficulty) filter.difficulty = difficulty;

    const tests = await Listening.find(filter).select(
      "-sections.questions.correctAnswer -sections.transcript"
    );

    return NextResponse.json({ success: true, data: tests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new listening test
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const test = await Listening.create(body);

    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
