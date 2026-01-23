"use client";

import React, { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// --- INTERFACES ---
interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface IReview {
  _id: string;
  // Backenddan populate bo'lib keladi, shuning uchun bu object
  userId: ReviewUser | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsSlider() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ma'lumotlarni olish
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/review");
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Auto-play (5 sekund)
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, reviews.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-10 mx-auto animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white h-64 rounded-3xl animate-pulse shadow-sm"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-20  overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons (Desktop) */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#9C74FF] hover:scale-110 transition-all hidden lg:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#9C74FF] hover:scale-110 transition-all hidden lg:flex"
          >
            <ChevronRight size={24} />
          </button>

          {/* Cards Wrapper */}
          <div className="overflow-hidden p-4 -m-4">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => {
                // USERNI ANIQLASH LOGIKASI
                // Backenddan `userId` object bo'lib kelyapti (name, avatar bilan)
                const user = review.userId;
                const userName = user?.name;
                console.log(userName);

                return (
                  <div
                    key={review._id}
                    className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-4"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 h-full flex flex-col relative group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                      {/* Quote Icon */}
                      <div className="absolute top-6 right-8 text-purple-100/50 group-hover:text-purple-100 transition-colors">
                        <Quote size={48} fill="currentColor" />
                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < review.rating ? "#FBBF24" : "none"}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 leading-relaxed mb-8 flex-1 text-[15px]">
                        "
                        {review.comment.length > 140
                          ? review.comment.substring(0, 140) + "..."
                          : review.comment}
                        "
                      </p>

                      {/* User Info (Faqat Name va Avatar) */}
                      <div className="flex items-center gap-3 mt-auto border-t border-gray-50 pt-5">
                        {/* Name & Date */}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {userName}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex justify-center gap-2 mt-8 lg:hidden">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-[#9C74FF]" : "w-1.5 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
