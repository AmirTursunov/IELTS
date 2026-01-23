import { Schema, model, models } from "mongoose";

const TestReviewSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    testId: { type: String, required: true, index: true },
    testType: { type: String, required: true }, // listening / reading
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    pageUrl: { type: String },
    timeSpentSec: { type: Number, default: 0 },

    summary: {
      total: Number,
      correct: Number,
      incorrect: Number,
      unanswered: Number,
      bandScore: Number,
    },
  },
  { timestamps: true },
);

export const TestReview =
  models.TestReview || model("TestReview", TestReviewSchema);
