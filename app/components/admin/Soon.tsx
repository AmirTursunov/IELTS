"use client";
import React, { FC } from "react";
import { PenTool, Mic } from "lucide-react";

interface ComingSoonProps {
  type: "writing" | "speaking";
}

export const ComingSoonContent: FC<ComingSoonProps> = ({ type }) => {
  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg max-w-md">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            {type === "writing" ? (
              <PenTool size={40} className="text-blue-600" />
            ) : (
              <Mic size={40} className="text-blue-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 capitalize">
            {type} Tests
          </h2>
          <p className="text-gray-600 mb-6">
            This section is coming soon! We're working hard to bring you the
            best {type} test management experience.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm font-medium">
              🚀 Expected release: Q1 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
