import mongoose, { Schema, Document } from "mongoose";

// Question interface

export interface IListeningQuestion {
  questionNumber: number;
  questionType:
    | "multiple-choice"
    | "matching"
    | "plan-map-diagram"
    | "form-completion"
    | "note-completion"
    | "table-completion"
    | "flow-chart"
    | "summary-completion"
    | "sentence-completion"
    | "short-answer";
  contextText?: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  instruction?: string;
  points: number;
  imageUrl?: string;
}

// Section interface
export interface IListeningSection {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  transcript?: string;
  questions: IListeningQuestion[];
}

// Listening test interface
export interface IListening extends Document {
  testName: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number; // in minutes
  sections: IListeningSection[];
  totalQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

// Question schema

const ListeningQuestionSchema = new Schema<IListeningQuestion>({
  questionNumber: { type: Number, required: true },
  questionType: {
    type: String,
    enum: [
      "multiple-choice",
      "matching",
      "plan-map-diagram",
      "form-completion",
      "note-completion",
      "table-completion",
      "flow-chart",
      "summary-completion",
      "sentence-completion",
      "short-answer",
    ],
    required: true,
  },

  contextText: { type: String },
  question: { type: String, required: true },
  instruction: { type: String },
  options: [String],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  points: { type: Number, default: 1 },
  imageUrl: { type: String },
});

// Section schema
const ListeningSectionSchema = new Schema<IListeningSection>({
  sectionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  audioUrl: { type: String, required: true },
  transcript: String,
  questions: [ListeningQuestionSchema],
});

// Listening test schema
const ListeningSchema = new Schema<IListening>(
  {
    testName: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    timeLimit: { type: Number, default: 30 },
    sections: [ListeningSectionSchema],
    totalQuestions: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

// Export model
export const Listening =
  mongoose.models.Listening ||
  mongoose.model<IListening>("Listening", ListeningSchema);
