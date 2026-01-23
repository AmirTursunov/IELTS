"use client";

import React, { useMemo } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  test: ListeningTest | null;
  testId: string | number;
  currentPart: number; // 0-based
  answers: Record<number, string>;
  flaggedQuestions: Set<number>;
  onCheckClick?: () => void;
};

// --- TYPES ---
interface Question {
  questionNumber: number;
  questionType: string;
  contextText?: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  imageUrl?: string;
}
interface Section {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  transcript?: string;
  questions: Question[];
}
interface ListeningTest {
  _id: string;
  testName: string;
  difficulty: string;
  timeLimit: number;
  testType: string;
  sections: Section[];
  totalQuestions: number;
}

export default function ListeningFooterNav({
  test,
  testId,
  currentPart,
  answers,
  flaggedQuestions,
  onCheckClick,
}: Props) {
  const router = useRouter();
  const sections = test?.sections || [];

  // Statistikani hisoblash
  const partStats = useMemo(() => {
    return sections.map((sec) => {
      const qns = Array.from(
        new Set((sec?.questions || []).map((q) => q.questionNumber)),
      );
      const total = qns.length;

      const answered = qns.reduce((acc, qn) => {
        const v = (answers?.[qn] || "").trim();
        return acc + (v ? 1 : 0);
      }, 0);

      return { total, answered, qns: qns.sort((a, b) => a - b) };
    });
  }, [sections, answers]);

  const questionsForCurrentPart = partStats[currentPart]?.qns || [];

  const goToPart = (idx: number) => {
    router.push(`/listening/${testId}?part=${idx}`);
  };

  const handlePrevPart = () => {
    if (currentPart > 0) goToPart(currentPart - 1);
  };

  const handleNextPart = () => {
    if (currentPart < sections.length - 1) goToPart(currentPart + 1);
  };

  const scrollToQuestion = (qn: number) => {
    const el = document.getElementById(`q-${qn}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!test || sections.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-11 right-0 z-50 flex items-end gap-1 p-2 bg-linear-to-t from-white/50 to-transparent">
        <div className="flex gap-1 bg-white p-1 rounded-t-lg shadow-sm border-t border-l border-r border-gray-200">
          {/* Previous Arrow */}
          <button
            onClick={handlePrevPart}
            disabled={currentPart === 0}
            className="h-10 w-12 bg-gray-900 rounded flex items-center justify-center text-white hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Part"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNextPart}
            disabled={currentPart === sections.length - 1}
            className="h-10 w-12 bg-gray-900 rounded flex items-center justify-center text-white hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Part"
          >
            <ChevronRight size={24} />
          </button>

          {/* Check Button */}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-300 bg-white h-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex h-full w-full">
          {/* Grid columns soni sectionlar soniga teng bo'ladi (4 ta part = 4 ta ustun) */}
          <div className="w-full grid grid-cols-4 h-full">
            {sections.map((_, idx) => {
              const st = partStats[idx] || { answered: 0, total: 0 };
              const isCurrent = idx === currentPart;

              return (
                <div
                  key={idx}
                  onClick={() => goToPart(idx)}
                  className={`
                    relative flex items-center justify-center cursor-pointer transition-colors border-r last:border-r-0 border-gray-200 h-full
                    ${isCurrent ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
                  `}
                >
                  {/* Active Indicator Line */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#9C74FF]"></div>
                  )}

                  <div className="flex flex-col xl:flex-row items-center gap-2 xl:gap-4 w-full justify-center">
                    {/* Part Label */}
                    <span
                      className={`font-bold text-sm whitespace-nowrap ${isCurrent ? "text-gray-900" : "text-gray-500"}`}
                    >
                      Part {idx + 1}
                    </span>

                    {/* Content: Numbers or Stats */}
                    {isCurrent ? (
                      // BIR QATORDA TURISHI UCHUN: flex-nowrap
                      <div className="flex flex-nowrap items-center gap-0.5 overflow-x-auto no-scrollbar">
                        {questionsForCurrentPart.map((qn) => {
                          const isFlagged = flaggedQuestions?.has(qn);
                          const isAnswered = !!answers?.[qn];

                          return (
                            <button
                              key={qn}
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToQuestion(qn);
                              }}
                              className={`
                                h-7 w-7 flex items-center justify-center text-[11px] font-bold rounded-sm border transition-all shrink-0
                                ${
                                  isFlagged
                                    ? "bg-purple-100 border-[#9C74FF] text-[#5B31C9]"
                                    : isAnswered
                                      ? "bg-gray-200 border-gray-400 text-gray-800"
                                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
                                }
                              `}
                              title={`Question ${qn}`}
                            >
                              {qn}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {st.answered} / {st.total}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
