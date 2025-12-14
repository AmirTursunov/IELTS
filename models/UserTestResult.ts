import mongoose, { Schema, Document } from "mongoose";

export interface IUserTestResult extends Document {
  userId: string;
  testId: string;
  testType: "reading" | "listening";
  answers: {
    questionNumber: number;
    userAnswer: string | string[];
    isCorrect: boolean;
    points: number;
  }[];
  totalScore: number;
  maxScore: number;
  bandScore: number; // IELTS band score (0-9)
  completedAt: Date;
  timeSpent: number; // in seconds
}

const UserTestResultSchema = new Schema<IUserTestResult>({
  userId: { type: String, required: true },
  testId: { type: String, required: true },
  testType: { type: String, enum: ["reading", "listening"], required: true },
  answers: [
    {
      questionNumber: Number,
      userAnswer: Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number,
    },
  ],
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  bandScore: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  timeSpent: Number,
});

export const UserTestResult =
  mongoose.models.UserTestResult ||
  mongoose.model<IUserTestResult>("UserTestResult", UserTestResultSchema);
