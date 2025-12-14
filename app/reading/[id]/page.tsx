"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Loader2,
  GripVertical,
  CheckCircle2,
  XCircle,
  Flag,
  X,
  Play,
  RotateCcw,
} from "lucide-react";

const API_BASE = "/api";

export default function ReadingTestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const testId = params?.id as string;
  const currentPart = parseInt(searchParams?.get("part") || "0");

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const passageContainerRef = useRef<HTMLDivElement>(null);

  const [highlights, setHighlights] = useState<
    { start: number; end: number; color: string; note?: string }[]
  >([]);

  const [sel, setSel] = useState<{
    text: string;
    start: number;
    end: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  const [noteModal, setNoteModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Text selection - faqat passage ichida
  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      // Faqat passage container ichida ishlaydi
      const passageContainer = passageContainerRef.current;
      if (!passageContainer || !passageContainer.contains(e.target as Node)) {
        return;
      }

      const s = window.getSelection();
      if (!s || s.rangeCount === 0 || s.isCollapsed) return;

      const text = s.toString().trim();
      if (!text) return;

      const r = s.getRangeAt(0);
      const pre = r.cloneRange();
      const container = document.querySelector(".passage-content");
      if (!container) return;
      pre.selectNodeContents(container);
      pre.setEnd(r.startContainer, r.startOffset);
      const start = pre.toString().length;
      const end = start + text.length;

      const rect = r.getBoundingClientRect();
      setSel({ text, start, end, clientX: rect.left, clientY: rect.top - 48 });
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  useEffect(() => {
    if (!testId || testId === "undefined") {
      setError("Invalid test ID");
      setLoading(false);
      return;
    }
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (!test || !testStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, testStarted]);

  const handleMouseDown = () => {
    setIsDragging(true);
    // Text selection ni o'chirish
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth >= 30 && newWidth <= 70) setLeftWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Text selection ni qayta yoqish
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/reading/${testId}`);
      const result = await response.json();
      if (result.success) {
        setTest(result.data);
        setTimeRemaining(
          result.data.timeLimit ? result.data.timeLimit * 60 : 3600
        );
      } else {
        setError(result.error || "Failed to load test");
      }
    } catch (error: any) {
      console.error("Error loading test:", error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }));
  };

  const toggleFlag = (questionNumber: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
  };

  const calculateResult = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const details: any[] = [];

    test.passages.forEach((passage: any) => {
      passage.questions.forEach((question: any) => {
        const userAnswer = answers[question.questionNumber];
        const correctAnswer =
          typeof question.correctAnswer === "string"
            ? question.correctAnswer
            : question.correctAnswer?.[0] || "";

        const isCorrect =
          userAnswer?.toLowerCase().trim() ===
          correctAnswer.toLowerCase().trim();

        if (!userAnswer) {
          unanswered++;
          details.push({
            ...question,
            userAnswer: null,
            isCorrect: false,
            status: "unanswered",
            correctAnswer: correctAnswer,
          });
        } else if (isCorrect) {
          correct++;
          details.push({
            ...question,
            userAnswer,
            isCorrect: true,
            status: "correct",
            correctAnswer: correctAnswer,
          });
        } else {
          incorrect++;
          details.push({
            ...question,
            userAnswer,
            isCorrect: false,
            status: "incorrect",
            correctAnswer: correctAnswer,
          });
        }
      });
    });

    const total = correct + incorrect + unanswered;
    const score = ((correct / total) * 9).toFixed(1);

    return {
      correct,
      incorrect,
      unanswered,
      total,
      score,
      details,
      timeTaken: test.timeLimit * 60 - timeRemaining,
    };
  };

  const handleSubmit = async () => {
    const resultData = calculateResult();
    setResult(resultData);
    setShowResult(true);
    setShowSubmitModal(false);
  };

  const goToNextPart = () => {
    if (currentPart < (test?.passages?.length || 1) - 1) {
      router.push(`/reading/${testId}?part=${currentPart + 1}`);
    }
  };

  const goToPreviousPart = () => {
    if (currentPart > 0) {
      router.push(`/reading/${testId}?part=${currentPart - 1}`);
    }
  };

  const groupQuestionsByType = (questions: any[]) => {
    const groups: any[] = [];
    let currentGroup: any = null;

    questions.forEach((question) => {
      if (!currentGroup || currentGroup.type !== question.questionType) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          type: question.questionType,
          start: question.questionNumber,
          end: question.questionNumber,
          questions: [question],
        };
      } else {
        currentGroup.end = question.questionNumber;
        currentGroup.questions.push(question);
      }
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const renderInstructions = (type: string, start: number, end: number) => {
    const instructions: { [key: string]: { title: string; text: string } } = {
      "multiple-choice": {
        title: `Questions ${start}-${end}`,
        text: "Choose the correct letter: A, B, C, or D.",
      },
      "true-false-not-given": {
        title: `Questions ${start}-${end}`,
        text: "Do the following statements agree with the information given in Reading Passage?\nIn boxes on your answer sheet, write\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
      },
      matching: {
        title: `Questions ${start}-${end}`,
        text: "Match each statement with the correct option.",
      },
      "sentence-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the sentences. Write ONE WORD ONLY.",
      },
      "short-answer": {
        title: `Questions ${start}-${end}`,
        text: "Answer the questions. Write NO MORE THAN THREE WORDS.",
      },
    };

    const instruction = instructions[type] || {
      title: `Questions ${start}-${end}`,
      text: "Read the instructions carefully.",
    };

    return (
      <div className="bg-linear-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-3 rounded-r-lg mb-4 shadow-sm">
        <p className="font-bold text-gray-900 mb-1.5 text-sm">
          {instruction.title}
        </p>
        <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {instruction.text}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-4">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!test || !test.passages || test.passages.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Test not found</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!testStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-cyan-100">
            <div className="text-center mb-8">
              <div className="bg-linear-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-3xl inline-block mb-6 shadow-lg">
                IELTS READING
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                {test.title}
              </h1>
              <p className="text-gray-500 text-lg">Academic Reading Test</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-linear-to-br from-cyan-50 to-blue-50 p-6 rounded-xl text-center border border-cyan-200">
                <div className="text-3xl font-bold text-cyan-600 mb-2">
                  {test.passages.length}
                </div>
                <div className="text-gray-600 font-medium text-sm">
                  Passages
                </div>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-xl text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {test.timeLimit}
                </div>
                <div className="text-gray-600 font-medium text-sm">Minutes</div>
              </div>
              <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-6 rounded-xl text-center border border-indigo-200">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    test.difficulty === "Easy"
                      ? "text-green-600"
                      : test.difficulty === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {test.difficulty}
                </div>
                <div className="text-gray-600 font-medium text-sm">Level</div>
              </div>
            </div>

            <div className="bg-linear-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 rounded-r-xl p-5 mb-8">
              <h3 className="font-bold text-cyan-900 mb-3 flex items-center gap-2">
                <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  i
                </span>
                Test Instructions
              </h3>
              <ul className="text-sm text-cyan-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">•</span>
                  <span>
                    Read each passage carefully before answering questions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">•</span>
                  <span>Click the flag icon to mark questions for review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">•</span>
                  <span>Use navigation buttons to move between passages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-0.5">•</span>
                  <span>
                    Timer will start when you click &quot;Start Test&quot;
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setTestStarted(true)}
              className="w-full bg-linear-to-r from-cyan-500 to-blue-600 text-white py-5 rounded-xl font-bold text-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Play size={24} />
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result Page
  if (showResult && result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-cyan-100">
            <div className="bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 p-10 text-white">
              <h1 className="text-4xl font-bold mb-3">Test Completed!</h1>
              <p className="text-cyan-100 text-lg">
                IELTS Reading Test - {test.title}
              </p>
            </div>

            <div className="p-10 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-linear-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-6xl font-bold mb-2">
                      {result.score}
                    </div>
                    <p className="font-semibold text-cyan-100">Band Score</p>
                  </div>
                </div>
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-linear-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-5xl font-bold mb-2">
                      {result.correct}
                    </div>
                    <p className="font-semibold text-green-100">Correct</p>
                  </div>
                </div>
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-linear-to-br from-red-400 to-rose-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-5xl font-bold mb-2">
                      {result.incorrect}
                    </div>
                    <p className="font-semibold text-red-100">Incorrect</p>
                  </div>
                </div>
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-linear-to-br from-gray-400 to-slate-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-5xl font-bold mb-2">
                      {result.unanswered}
                    </div>
                    <p className="font-semibold text-gray-100">Skipped</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-full border border-cyan-200">
                  <Clock size={20} className="text-cyan-600" />
                  <span className="text-gray-700 font-medium">
                    Time: {formatTime(result.timeTaken)} /{" "}
                    {formatTime(test.timeLimit * 60)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-linear-to-b from-cyan-500 to-blue-600 rounded-full"></div>
                Answer Review
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {result.details.map((detail: any, index: number) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                      detail.status === "correct"
                        ? "bg-linear-to-r from-green-50 to-emerald-50 border-green-300"
                        : detail.status === "incorrect"
                        ? "bg-linear-to-r from-red-50 to-rose-50 border-red-300"
                        : "bg-linear-to-r from-gray-50 to-slate-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {detail.status === "correct" ? (
                        <CheckCircle2
                          className="text-green-600 mt-1 shrink-0"
                          size={24}
                        />
                      ) : detail.status === "incorrect" ? (
                        <XCircle
                          className="text-red-600 mt-1 shrink-0"
                          size={24}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-400 mt-1 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                          ?
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-3 text-lg">
                          Q{detail.questionNumber}: {detail.question}
                        </p>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-gray-600 font-medium">
                              Your Answer:{" "}
                            </span>
                            <span
                              className={`font-bold ${
                                detail.status === "correct"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {detail.userAnswer || "Not answered"}
                            </span>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <span className="text-gray-600 font-medium">
                              Correct Answer:{" "}
                            </span>
                            <span className="text-green-700 font-bold">
                              {detail.correctAnswer}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-linear-to-r from-gray-50 to-slate-50 flex gap-4 justify-center border-t border-gray-200">
              <button
                onClick={() => router.push("/")}
                className="px-10 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Back to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const HIGHLIGHT_COLORS = [
    { name: "yellow", bg: "bg-yellow-300", hover: "hover:bg-yellow-400" },
    { name: "cyan", bg: "bg-cyan-300", hover: "hover:bg-cyan-400" },
    { name: "fuchsia", bg: "bg-fuchsia-300", hover: "hover:bg-fuchsia-400" },
  ];

  const renderHighlighted = () => {
    let last = 0;
    const nodes: JSX.Element[] = [];
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    sorted.forEach((h, i) => {
      const before = currentPassage.content.slice(last, h.start);
      const body = currentPassage.content.slice(h.start, h.end);
      const color = HIGHLIGHT_COLORS.find((c) => c.name === h.color)!;

      nodes.push(<span key={`txt-${i}`}>{before}</span>);
      nodes.push(
        <span
          key={`hl-${i}`}
          className={`relative group ${color.bg} cursor-pointer`}
        >
          {body}
          {h.note && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {h.note}
            </span>
          )}
        </span>
      );
      last = h.end;
    });

    nodes.push(<span key="tail">{currentPassage.content.slice(last)}</span>);
    return <>{nodes}</>;
  };

  const currentPassage = test.passages[currentPart];
  if (!currentPassage) return null;

  const questionGroups = groupQuestionsByType(currentPassage.questions || []);
  const startNumber = currentPassage.questions?.[0]?.questionNumber ?? 1;
  const endNumber =
    currentPassage.questions?.[currentPassage.questions.length - 1]
      ?.questionNumber ?? currentPassage.questions.length;

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-gray-50 to-slate-50">
      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-cyan-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Submit Test?</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <p className="text-gray-600 mb-6 text-base leading-relaxed">
              Are you sure you want to submit? You won&apos;t be able to change
              your answers after submission.
            </p>
            <div className="bg-linear-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-r-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <strong>Answered:</strong> {Object.keys(answers).length} /{" "}
                {test.passages.reduce(
                  (acc: number, p: any) => acc + p.questions.length,
                  0
                )}{" "}
                questions
              </p>
              {flaggedQuestions.size > 0 && (
                <p className="text-sm text-yellow-800 mt-2 flex items-center gap-2">
                  <Flag size={14} className="fill-yellow-600 text-yellow-600" />
                  <strong>{flaggedQuestions.size}</strong> questions flagged for
                  review
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 font-semibold shadow-lg transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal - Yaxshilangan */}
      {noteModal && activeIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Note</h3>
              <button
                onClick={() => {
                  setNoteModal(false);
                  setActiveIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              rows={4}
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setNoteModal(false);
                  setActiveIndex(null);
                }}
                className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeIndex !== null) {
                    const copy = [...highlights];
                    copy[activeIndex].note = noteText;
                    setHighlights(copy);
                  }
                  setNoteModal(false);
                  setActiveIndex(null);
                }}
                className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold shadow transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Compact */}
      <header className="bg-linear-to-r from-cyan-600 to-blue-700 shadow-lg shrink-0">
        <div className="max-w-full mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-white hover:text-cyan-100 transition-colors bg-white/10 px-3 py-1.5 rounded-lg text-sm"
            >
              <ChevronLeft size={16} />
              <span className="font-medium">Exit</span>
            </button>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="bg-white text-cyan-600 px-3 py-1 rounded-md font-bold text-sm shadow-md">
                IELTS
              </div>
              <span className="text-white font-semibold text-sm">
                {test.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-lg backdrop-blur-sm">
              <Clock size={18} className="text-white" />
              <span className="text-white font-bold text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-white text-cyan-600 px-5 py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-50 transition-all shadow-lg"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* Part Info Banner - Compact */}
      <div className="bg-linear-to-r from-cyan-500 to-blue-600 shrink-0 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-2 text-white">
          <h2 className="text-base font-bold">
            READING PASSAGE {currentPart + 1}
          </h2>
          <p className="text-cyan-100 text-xs italic">
            You should spend about 20 minutes on Questions {startNumber}-
            {endNumber}, which are based on Reading Passage {currentPart + 1}{" "}
            below.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full flex p-6 gap-0">
          {/* Passage */}
          <div
            className="bg-white rounded-l-2xl shadow-xl flex flex-col overflow-hidden border-2 border-r-0 border-cyan-100"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="px-8 py-6 border-b-2 border-cyan-100 shrink-0 bg-linear-to-r from-white to-cyan-50">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentPassage.title}
              </h3>
            </div>
            <div
              className="flex-1 overflow-y-auto px-8 py-6"
              ref={passageContainerRef}
            >
              <div
                className="prose prose-lg max-w-none text-gray-800 leading-[1.8] whitespace-pre-wrap passage-content"
                style={{ textAlign: "justify" }}
              >
                {renderHighlighted()}
              </div>
              {sel && (
                <div
                  className="fixed z-50 flex items-center gap-2 bg-white shadow-xl rounded-full p-2 border border-gray-200"
                  style={{ left: sel.clientX, top: sel.clientY }}
                >
                  {/* X button - popupni yopish */}
                  <button
                    onClick={() => {
                      setSel(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* 3 ta rang */}
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setHighlights((h) => [
                          ...h,
                          { start: sel.start, end: sel.end, color: c.name },
                        ]);
                        setSel(null);
                        window.getSelection()?.removeAllRanges();
                      }}
                      className={`w-8 h-8 rounded-full ${c.bg} ${c.hover} transition`}
                      aria-label={c.name}
                    />
                  ))}

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* PLUS btn - note qo'shish */}
                  <button
                    onClick={() => {
                      setHighlights((h) => [
                        ...h,
                        {
                          start: sel.start,
                          end: sel.end,
                          color: "yellow",
                          note: "",
                        },
                      ]);
                      setActiveIndex(highlights.length);
                      setNoteText("");
                      setSel(null);
                      window.getSelection()?.removeAllRanges();
                      setNoteModal(true);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center transition"
                    aria-label="Add note"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resizer */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-3 bg-linear-to-b from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 cursor-col-resize flex items-center justify-center transition-all shadow-lg ${
              isDragging ? "from-cyan-500 to-blue-600" : ""
            }`}
          >
            <GripVertical size={18} className="text-white drop-shadow-md" />
          </div>

          {/* Questions */}
          <div
            className="bg-white rounded-r-2xl shadow-xl flex flex-col overflow-hidden border-2 border-l-0 border-cyan-100"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="px-8 py-6 border-b-2 border-cyan-100 shrink-0 bg-linear-to-r from-cyan-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900">Questions</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-8">
                {questionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    {renderInstructions(group.type, group.start, group.end)}
                    {group.questions.map((question: any) => (
                      <div
                        key={question.questionNumber}
                        className={`space-y-3 group relative transition-all ${
                          flaggedQuestions.has(question.questionNumber)
                            ? "bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-5 shadow-md"
                            : "hover:bg-gray-50 rounded-xl p-2"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex items-start gap-2 shrink-0">
                            <span className="font-bold text-gray-800 text-lg">
                              {question.questionNumber}.
                            </span>
                            <button
                              onClick={() =>
                                toggleFlag(question.questionNumber)
                              }
                              className={`mt-1 transition-all ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "opacity-100 scale-110"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                              title="Flag for review"
                            >
                              <Flag
                                size={18}
                                className={
                                  flaggedQuestions.has(question.questionNumber)
                                    ? "fill-red-500 text-red-500 drop-shadow-md"
                                    : "text-gray-400 hover:text-red-500"
                                }
                              />
                            </button>
                          </div>

                          <div className="flex-1">
                            <p className="text-gray-800 mb-4 leading-relaxed">
                              {question.question}
                            </p>

                            {question.questionType === "multiple-choice" &&
                              question.options && (
                                <div className="space-y-2">
                                  {question.options.map(
                                    (option: string, idx: number) => (
                                      <label
                                        key={idx}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                          answers[question.questionNumber] ===
                                          option
                                            ? "bg-cyan-50 border-cyan-400 shadow-md"
                                            : "border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/30"
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${question.questionNumber}`}
                                          value={option}
                                          checked={
                                            answers[question.questionNumber] ===
                                            option
                                          }
                                          onChange={(e) =>
                                            handleAnswerChange(
                                              question.questionNumber,
                                              e.target.value
                                            )
                                          }
                                          className="w-5 h-5 text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <span className="text-gray-800 font-medium">
                                          {option}
                                        </span>
                                      </label>
                                    )
                                  )}
                                </div>
                              )}

                            {question.questionType ===
                              "true-false-not-given" && (
                              <div className="space-y-2">
                                {["TRUE", "FALSE", "NOT GIVEN"].map(
                                  (option) => (
                                    <label
                                      key={option}
                                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        answers[question.questionNumber] ===
                                        option
                                          ? "bg-cyan-50 border-cyan-400 shadow-md"
                                          : "border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/30"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${question.questionNumber}`}
                                        value={option}
                                        checked={
                                          answers[question.questionNumber] ===
                                          option
                                        }
                                        onChange={(e) =>
                                          handleAnswerChange(
                                            question.questionNumber,
                                            e.target.value
                                          )
                                        }
                                        className="w-5 h-5 text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                                      />
                                      <span className="text-gray-800 font-semibold">
                                        {option}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            )}

                            {question.questionType === "matching" &&
                              question.options && (
                                <select
                                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 font-medium bg-white"
                                  value={answers[question.questionNumber] || ""}
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question.questionNumber,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="" className="text-gray-400">
                                    Choose answer
                                  </option>
                                  {question.options.map(
                                    (option: string, idx: number) => (
                                      <option key={idx} value={option}>
                                        {option}
                                      </option>
                                    )
                                  )}
                                </select>
                              )}

                            {(question.questionType === "sentence-completion" ||
                              question.questionType === "short-answer") && (
                              <input
                                type="text"
                                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 font-medium"
                                placeholder={
                                  question.questionType ===
                                  "sentence-completion"
                                    ? "Write ONE WORD ONLY"
                                    : "Write NO MORE THAN THREE WORDS"
                                }
                                value={answers[question.questionNumber] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.questionNumber,
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Compact */}
      <div className="bg-white border-t-2 border-cyan-100 shrink-0 shadow-lg">
        <div className="max-w-full mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {test.passages.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/reading/${testId}?part=${idx}`)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    idx === currentPart
                      ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={goToPreviousPart}
                disabled={currentPart === 0}
                className="px-6 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={goToNextPart}
                disabled={currentPart === test.passages.length - 1}
                className="px-6 py-1.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold shadow-md transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
