import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  questionNumber: number;
  questionType:
    | "multiple-choice"
    | "true-false-not-given"
    | "matching"
    | "sentence-completion"
    | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface IPassage {
  passageNumber: number;
  title: string;
  content: string;
  questions: IQuestion[];
}

export interface IReading extends Document {
  title: string;
  testType: "Academic" | "General";
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  passages: IPassage[];
  totalQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionNumber: { type: Number, required: true },
    questionType: {
      type: String,
      enum: [
        "multiple-choice",
        "true-false-not-given",
        "matching",
        "sentence-completion",
        "short-answer",
      ],
      required: true,
    },
    question: { type: String, required: true },
    options: [String],
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    points: { type: Number, default: 1 },
  },
  { _id: false } // Subdocument uchun _id kerak emas
);

const PassageSchema = new Schema<IPassage>(
  {
    passageNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { _id: false }
);

const ReadingSchema = new Schema<IReading>(
  {
    title: { type: String, required: true },
    testType: { type: String, enum: ["Academic", "General"], required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    timeLimit: { type: Number, default: 60 },
    passages: [PassageSchema],
    totalQuestions: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Reading =
  mongoose.models.Reading || mongoose.model<IReading>("Reading", ReadingSchema);
