"use client";
import { useState } from "react";
import ExamModal from "./useDemoModal";

export default function UseDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      <button
        className="relative bg-[#9C74FF] text-white px-9 py-4 rounded-xl font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-95 group overflow-hidden animate-bounce-slow"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/30 to-transparent" />

        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-xl bg-[#9C74FF] animate-pulse-ring" />

        {/* Sparkles */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F8CB47] rounded-full animate-pulse" />
        <div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#55BE9D] rounded-full animate-pulse"
          style={{ animationDelay: "100ms" }}
        />

        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-2">
          {/* <span className="text-2xl animate-bounce">🎯</span> */}
          Use Demo
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-[#9C74FF] blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
      </button>

      {isModalOpen && <ExamModal setIsOpen={setIsModalOpen} />}
    </>
  );
}
