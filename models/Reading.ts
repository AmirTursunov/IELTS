import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  questionNumber: number;
  questionType:
    | "multiple-choice"
    | "true-false-not-given"
    | "yes-no-not-given"
    | "matching"
    | "matching-headings"
    | "matching-headings-drag-drop"
    | "matching-sentence-endings"
    | "matching-features"
    | "matching-information"
    | "summary-completion"
    | "summary-completion-box"
    | "summary-completion-with-text"
    | "note-completion"
    | "table-completion"
    | "flow-chart-completion"
    | "diagram-labeling"
    | "sentence-completion"
    | "short-answer";
  question: string;
  contextText?: string;
  sharedText?: string;
  instruction?: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface IPassage {
  passageNumber: number;
  title: string;
  content: string;
  hasParagraphs?: boolean;
  hasInputParagraphs?: boolean;
  paragraphs?: string[];
  questions: IQuestion[];
}

export interface IReading extends Document {
  title: string;
  testType: "Academic" | "General";
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  status: "paid" | "free";
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
        "yes-no-not-given",
        "matching",
        "matching-headings",
        "matching-headings-drag-drop",
        "matching-sentence-endings",
        "matching-features",
        "matching-information",
        "summary-completion",
        "summary-completion-box",
        "summary-completion-with-text",
        "note-completion",
        "table-completion",
        "flow-chart-completion",
        "diagram-labeling",
        "sentence-completion",
        "short-answer",
      ],
      required: true,
    },
    question: { type: String, required: true },
    contextText: { type: String },
    sharedText: { type: String },
    instruction: { type: String },
    options: [String],
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    points: { type: Number, default: 1 },
  },
  { _id: false },
);

const PassageSchema = new Schema<IPassage>(
  {
    passageNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    hasParagraphs: { type: Boolean, default: false },
    hasInputParagraphs: { type: Boolean, default: false },
    paragraphs: { type: [String], default: [] },
    questions: [QuestionSchema],
  },
  { _id: false },
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
    status: { type: String, enum: ["paid", "free"], default: "paid" },
    passages: [PassageSchema],
    totalQuestions: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const Reading =
  mongoose.models.Reading || mongoose.model<IReading>("Reading", ReadingSchema);
