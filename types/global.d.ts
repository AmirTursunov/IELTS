import mongoose from "mongoose";

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// utils/bandScoreHelper.ts
export function getBandScoreDescription(score: number): string {
  if (score >= 9.0) return "Expert user";
  if (score >= 8.0) return "Very good user";
  if (score >= 7.0) return "Good user";
  if (score >= 6.0) return "Competent user";
  if (score >= 5.0) return "Modest user";
  if (score >= 4.0) return "Limited user";
  return "Extremely limited user";
}
