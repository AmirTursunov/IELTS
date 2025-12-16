"use client";
import React from "react";
import { X } from "lucide-react"; // optional: react-icons yoki lucide-react ishlatsa bo'ladi
import { redirect } from "next/navigation";

export default function ExamModal({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-80 relative p-6 flex flex-col items-center gap-6">
        {/* Close X button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl text-black font-bold text-center">
          Choose Exam Section
        </h2>

        {/* Buttons */}
        <div className="flex flex-col w-full gap-4">
          <button
            className="w-full bg-[#9C74FF] hover:bg-[#5f29e7] text-white font-semibold py-2 rounded-lg transition"
            onClick={() => redirect("/reading")}
          >
            Reading
          </button>

          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
            onClick={() => redirect("/listening")}
          >
            Listening
          </button>
        </div>
      </div>
    </div>
  );
}
