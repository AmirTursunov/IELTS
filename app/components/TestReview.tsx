"use client";

import React, { useState } from "react";
import { X, Sparkles, Star, Check, AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void; // Redirect yoki yopish logikasi parentda bo'ladi
  testId: string;
  userId?: string;
  // MUHIM: Endi bu majburiy! Har bir joyda aniq berilishi kerak.
  testType: "listening" | "reading" | "writing" | "speaking" | string;
  endpoint?: string;
  title?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ReviewModal({
  isOpen,
  onClose,
  testId,
  userId = "anonymous",
  testType, // Default qiymat olib tashlandi, endi u propsdan keladi
  endpoint = "/api/review",
  title = "Leave a Review",
}: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [message, setMessage] = useState("");

  const canSubmit = comment.trim().length >= 3;

  async function handleSubmit() {
    if (submitting) return;

    setStatus(null);
    setMessage("");

    if (!canSubmit) {
      setStatus("error");
      setMessage("Please write a short review (min 3 characters).");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        testId,
        userId,
        testType, // Props orqali kelgan to'g'ri turni yuboramiz
        rating: clamp(rating, 1, 5),
        comment: comment.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to submit review.");
      }

      setStatus("success");
      setMessage("Thanks! Redirecting...");
      setComment("");

      // Muvaffaqiyatli bo'lgach, 1.5 soniyadan keyin yopiladi
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const displayRating = hoverRating ?? rating;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden z-10 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={handleSkip}
            className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="px-5 pt-5">
          <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-white border border-purple-200 p-2 shadow-sm">
              <Sparkles className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="font-bold text-purple-900 text-sm">
                Help us improve!
              </p>
              <p className="text-xs text-purple-800/80 mt-0.5">
                Your feedback helps us improve our {testType} tests.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {status && (
            <div
              className={`mb-4 rounded-xl border px-3 py-2 text-sm flex items-center gap-2 ${status === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
            >
              {status === "success" ? (
                <Check size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Stars */}
          <div className="mb-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const star = i + 1;
                const active = star <= displayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${active ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-100"}`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {displayRating} out of 5
            </p>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`What did you like about this ${testType} test?`}
              className="w-full h-28 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C74FF]/50 focus:border-[#9C74FF] transition-all bg-gray-50 focus:bg-white"
            />
            <div className="flex justify-between mt-1 px-1">
              <span className="text-xs text-gray-400">Min 3 characters</span>
              <span
                className={`text-xs ${comment.length > 0 && comment.length < 3 ? "text-red-500" : "text-gray-400"}`}
              >
                {comment.length} chars
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSkip}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`flex-1 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg shadow-purple-200 transition-all transform active:scale-95 ${!canSubmit || submitting ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-[#9C74FF] hover:bg-[#8B5FE8] text-white hover:shadow-purple-300"}`}
            >
              {submitting ? "Sending..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
