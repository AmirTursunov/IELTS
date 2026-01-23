"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  X,
  Bookmark,
  Plus,
  Trash2,
  MoreVertical,
  StickyNote,
} from "lucide-react";
import { QuestionNotes } from "../../components/QuestionNotes";
import Footer from "@/app/components/Footer";
import ListeningFooterNav from "@/app/components/listening/Footer";
import { set } from "mongoose";

// --- INTERFACES ---

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

interface Highlight {
  text: string;
  start: number;
  end: number;
  color: string;
  note?: string;
  id: string;
}

const HIGHLIGHT_COLORS = [
  { name: "yellow", bg: "bg-yellow-300", hover: "hover:bg-yellow-400" },
  { name: "purple", bg: "bg-purple-300", hover: "hover:bg-purple-400" },
  { name: "fuchsia", bg: "bg-fuchsia-300", hover: "hover:bg-fuchsia-400" },
];

const API_BASE = "/api";

export default function ListeningTestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const testId = params?.id as string;
  const currentPart = parseInt(searchParams?.get("part") || "0");

  const [test, setTest] = useState<ListeningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});

  // --- HIGHLIGHT SYSTEM ---
  const [highlights, setHighlights] = useState<{
    [contentId: string]: Highlight[];
  }>({});
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null,
  );
  const [sel, setSel] = useState<{
    text: string;
    start: number;
    end: number;
    contentId: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [editingHighlight, setEditingHighlight] = useState<{
    contentId: string;
    highlightId: string;
  } | null>(null);

  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [openNoteFor, setOpenNoteFor] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- EFFECTS ---

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Agar bosilgan joy highlight bo'lmasa, Delete tugmasini yopish
      if (!target.closest(".highlight-interactive")) {
        setActiveHighlightId(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
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
  useEffect(() => {
    const close = () => setOpenActionMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentPart]);

  // --- DATA LOADING & AUDIO ---
  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/listening/${testId}`);
      const result = await response.json();
      if (result.success) {
        setTest(result.data);
        setTimeRemaining(
          result.data.timeLimit ? result.data.timeLimit * 60 : 1800,
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

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }));
  };

  const toggleFlag = (questionNumber: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) newSet.delete(questionNumber);
      else newSet.add(questionNumber);
      return newSet;
    });
  };

  // ===== HIGHLIGHT LOGIC  =====

  const handleTextSelection = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();

    const s = window.getSelection();
    if (!s || s.rangeCount === 0 || s.isCollapsed) {
      return;
    }

    const text = s.toString().trim();
    if (!text) return;

    try {
      const r = s.getRangeAt(0);
      const pre = r.cloneRange();

      pre.selectNodeContents(e.currentTarget);
      pre.setEnd(r.startContainer, r.startOffset);

      const start = pre.toString().length;
      const end = start + text.length;

      const rect = r.getBoundingClientRect();

      setSel({
        text,
        start,
        end,
        contentId,
        clientX: rect.left,
        clientY: rect.top - 48,
      });
    } catch (err) {
      console.warn("Selection failed, likely outside boundaries.");
    }
  };

  const addHighlight = (colorName: string) => {
    if (!sel) return;

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      start: sel.start,
      end: sel.end,
      text: sel.text,
      color: colorName,
      note: undefined,
    };

    setHighlights((prev) => ({
      ...prev,
      [sel.contentId]: [...(prev[sel.contentId] || []), newHighlight],
    }));

    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  const openNoteModal = () => {
    if (!sel) return;

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      start: sel.start,
      end: sel.end,
      text: sel.text,
      color: "yellow",
      note: "",
    };

    setHighlights((prev) => ({
      ...prev,
      [sel.contentId]: [...(prev[sel.contentId] || []), newHighlight],
    }));

    setEditingHighlight({
      contentId: sel.contentId,
      highlightId: newHighlight.id,
    });
    setCurrentNoteText("");
    setShowNoteModal(true);
    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  const saveNote = () => {
    if (!editingHighlight) return;

    setHighlights((prev) => ({
      ...prev,
      [editingHighlight.contentId]: prev[editingHighlight.contentId].map((h) =>
        h.id === editingHighlight.highlightId
          ? { ...h, note: currentNoteText }
          : h,
      ),
    }));

    setShowNoteModal(false);
    setEditingHighlight(null);
    setCurrentNoteText("");
  };

  const deleteHighlight = (contentId: string, highlightId: string) => {
    setHighlights((prev) => ({
      ...prev,
      [contentId]: prev[contentId].filter((h) => h.id !== highlightId),
    }));
  };

  const renderTextWithHighlights = (
    text: string,
    contentId: string,
  ): JSX.Element[] => {
    const elementHighlights = highlights[contentId] || [];

    if (elementHighlights.length === 0) {
      return [<span key="full">{text}</span>];
    }

    const sortedHighlights = [...elementHighlights].sort(
      (a, b) => a.start - b.start,
    );
    const nodes: JSX.Element[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((h, i) => {
      if (h.start < lastIndex || h.start > text.length) return;

      // Matnning highlightgacha bo'lgan qismi
      const before = text.substring(lastIndex, h.start);
      if (before) {
        nodes.push(<span key={`txt-${i}`}>{before}</span>);
      }

      // Highlight qilingan qism
      const safeEnd = Math.min(h.end, text.length);
      const body = text.substring(h.start, safeEnd);
      const colorClass =
        HIGHLIGHT_COLORS.find((c) => c.name === h.color)?.bg || "bg-yellow-200";

      nodes.push(
        <span
          key={`hl-${h.id}`}
          // O'ZGARISH 1: cursor-pointer va highlight-interactive klassi
          className={`relative highlight-interactive ${colorClass} cursor-pointer rounded px-0.5 box-decoration-clone`}
          // O'ZGARISH 2: Click bo'lganda Delete tugmasini ko'rsatish/yashirish
          onClick={(e) => {
            e.stopPropagation();
            setActiveHighlightId(activeHighlightId === h.id ? null : h.id);
          }}
        >
          {body}

          {/* Note tooltip (agar note bo'lsa) */}
          {h.note && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
              {h.note}
            </span>
          )}

          {/* O'ZGARISH 3: Delete tugmasi faqat aktiv bo'lganda chiqadi (hoverda emas) */}
          {activeHighlightId === h.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteHighlight(contentId, h.id);
                setActiveHighlightId(null); // O'chirilgandan keyin yopish
              }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1.5 text-xs shadow-xl z-50 text-red-600 hover:bg-gray-50 whitespace-nowrap"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </span>,
      );
      lastIndex = safeEnd;
    });

    if (lastIndex < text.length) {
      nodes.push(<span key="tail">{text.substring(lastIndex)}</span>);
    }

    return nodes;
  };

  const handleSaveNote = (questionNumber: number, note: string) => {
    setNotes((prev) => {
      if (note.trim()) {
        return { ...prev, [questionNumber]: note };
      } else {
        const newNotes = { ...prev };
        delete newNotes[questionNumber];
        return newNotes;
      }
    });
  };

  // --- RESULT CALCULATION ---
  const calculateResult = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const details: any[] = [];

    test?.sections.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        const userAnswer = answers[question.questionNumber];
        const correctAnswer =
          typeof question.correctAnswer === "string"
            ? question.correctAnswer
            : question.correctAnswer?.[0] || "";

        const isCorrect =
          userAnswer?.toLowerCase().trim() ===
          correctAnswer.toLowerCase().trim();

        if (!userAnswer || userAnswer.trim() === "") {
          unanswered++;
        } else if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }

        details.push({
          questionNumber: question.questionNumber,
          question: question.question,
          userAnswer: userAnswer || "Not answered",
          correctAnswer,
          isCorrect,
        });
      });
    });

    return {
      correct,
      incorrect,
      unanswered,
      total: test?.sections.reduce(
        (sum: number, s: any) => sum + s.questions.length,
        0,
      ),
      details,
      band: calculateBand(correct),
    };
  };

  const calculateBand = (correct: number): number => {
    if (correct >= 39) return 9.0;
    if (correct >= 37) return 8.5;
    if (correct >= 35) return 8.0;
    if (correct >= 32) return 7.5;
    if (correct >= 30) return 7.0;
    if (correct >= 26) return 6.5;
    if (correct >= 23) return 6.0;
    if (correct >= 18) return 5.5;
    if (correct >= 16) return 5.0;
    if (correct >= 13) return 4.5;
    if (correct >= 10) return 4.0;
    if (correct >= 7) return 3.5;
    if (correct >= 5) return 3.0;
    if (correct >= 3) return 2.5;
    if (correct >= 1) return 2.0;
    return 1.0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const submitData = {
      testId: testId,
      testType: "listening",
      answers: Object.entries(answers).map(([questionNumber, userAnswer]) => ({
        questionNumber: parseInt(questionNumber),
        userAnswer: userAnswer,
      })),
      timeSpent: test!.timeLimit * 60 - timeRemaining,
    };

    try {
      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        const localResult = calculateResult();
        setResult({
          ...localResult,
          band: responseData.data.bandScore,
          correct: responseData.data.correctAnswers,
          total: responseData.data.totalQuestions,
        });
        setShowResult(true);
      } else {
        const localResult = calculateResult();
        setResult(localResult);
        setShowResult(true);
      }
    } catch (error) {
      alert("Network error occurred. Showing local results only.");
      const localResult = calculateResult();
      setResult(localResult);
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
    setShowSubmitModal(false);
  };

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C74FF] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Test
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/listening")}
              className="px-6 py-3 bg-[#9C74FF] text-white rounded-lg hover:bg-[#8B5FE8] font-semibold"
            >
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) return null;

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F5F2FF] via-[#EFE9FF] to-[#E6DEFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full border-2 border-[#9C74FF]/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-[#9C74FF] to-[#7B4DFF] rounded-full mb-4 shadow-lg">
              <Headphones className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {test.testName}
            </h1>

            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="px-4 py-2 bg-[#9C74FF]/20 text-[#9C74FF] rounded-full font-semibold capitalize">
                {test.difficulty}
              </span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {/* INFO */}
            <div className="bg-linear-to-r from-[#F5F2FF] to-[#EFE9FF] rounded-xl p-6 border border-[#9C74FF]/30">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Total Questions</p>
                  <p className="font-bold text-gray-900">
                    {test.sections.reduce(
                      (sum: number, s: any) => sum + s.questions.length,
                      0,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Parts</p>
                  <p className="font-bold text-gray-900">
                    {test.sections.length}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Format</p>
                  <p className="font-bold text-gray-900">IELTS Listening</p>
                </div>
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="bg-[#F5F2FF] border-l-4 border-[#9C74FF] p-6 rounded-r-xl">
              <h4 className="font-bold text-[#9C74FF] mb-3 flex items-center gap-2">
                ⚠️ Important Instructions
              </h4>

              <ul className="space-y-1 text-sm text-gray-700">
                {[
                  "You will hear the audio ONCE for each section",
                  "Answer all questions as you listen",
                  "Write your answers in the spaces provided",
                  "Follow word limits (e.g., ONE WORD ONLY)",
                  "Timer starts when you begin the test",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#9C74FF] mt-1">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* START BUTTON */}
          <button
            onClick={() => setTestStarted(true)}
            className="w-full py-4 bg-linear-to-r from-[#9C74FF] to-[#7B4DFF] text-white rounded-xl font-bold text-lg hover:from-[#8A63FF] hover:to-[#6A3CFF] transition-all shadow-lg transform hover:scale-105"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#9C74FF]/30">
            <div className="bg-[#9C74FF] px-8 py-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Test Results</h2>
              <p className="text-purple-100">{test.testName}</p>
            </div>
            <div className="p-8 border-b-2 border-purple-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-[#9C74FF] rounded-full mb-4 shadow-xl">
                  <span className="text-5xl font-bold text-white">
                    {result.band}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  IELTS Band Score
                </h3>
                <p className="text-gray-600">
                  {result.correct} out of {result.total} correct
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
                  <p className="text-3xl font-bold text-green-600">
                    {result.correct}
                  </p>
                  <span className="text-sm font-semibold text-green-800">
                    Correct
                  </span>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border-2 border-red-200">
                  <p className="text-3xl font-bold text-red-600">
                    {result.incorrect}
                  </p>
                  <span className="text-sm font-semibold text-red-800">
                    Incorrect
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                  <p className="text-3xl font-bold text-gray-600">
                    {result.unanswered}
                  </p>
                  <span className="text-sm font-semibold text-gray-800">
                    Unanswered
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Answer Review
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.details.map((detail: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${detail.isCorrect ? "bg-green-50 border-green-200" : detail.userAnswer === "Not answered" ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {detail.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-bold text-gray-900">
                          Question {detail.questionNumber}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{detail.question}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1 font-semibold">
                            Your Answer:
                          </p>
                          <p
                            className={`font-medium ${detail.userAnswer === "Not answered" ? "text-gray-500 italic" : detail.isCorrect ? "text-green-700" : "text-red-700"}`}
                          >
                            {detail.userAnswer}
                          </p>
                        </div>
                        {!detail.isCorrect && (
                          <div>
                            <p className="text-gray-600 mb-1 font-semibold">
                              Correct Answer:
                            </p>
                            <p className="font-medium text-green-700">
                              {detail.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-purple-50 px-8 py-6 flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-white border-2 border-[#9C74FF] text-[#9C74FF] rounded-xl font-semibold"
              >
                Retake Test
              </button>
              <button
                onClick={() => router.push("/listening")}
                className="flex-1 py-3 bg-[#9C74FF] text-white rounded-xl font-semibold"
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = test.sections[currentPart];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 flex flex-col">
      {/* SELECTION POPUP MENU */}
      {sel && (
        <div
          className="fixed z-50 flex items-center gap-2 bg-white shadow-xl rounded-full p-2 border border-gray-200"
          style={{ left: sel.clientX, top: sel.clientY }}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setSel(null);
              window.getSelection()?.removeAllRanges();
            }}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition"
          >
            <X size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Color Buttons */}
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => addHighlight(c.name)}
              className={`w-8 h-8 rounded-full ${c.bg} ${c.hover} transition border border-gray-300`}
            />
          ))}

          <div className="w-px h-6 bg-gray-300"></div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-[#9C74FF]/30">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Submit Test?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit?
              </p>
              {isSubmitting ? (
                <button
                  disabled
                  className="
    flex-1 px-6 py-3 w-full rounded-xl font-semibold
    bg-[#9C74FF] text-white
    shadow-md
    opacity-60 cursor-not-allowed
    hover:bg-[#9C74FF]
  "
                >
                  Submitting...
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-[#9C74FF] text-white rounded-xl font-semibold hover:bg-[#8B5FE8] shadow-md w-full"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Note</h3>
            <textarea
              value={currentNoteText}
              onChange={(e) => setCurrentNoteText(e.target.value)}
              placeholder="Type note..."
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 bg-[#9C74FF] text-white rounded text-sm hover:bg-[#8B5FE8]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#9C74FF] text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/listening")}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{test.testName}</h1>
                <p className="text-sm text-purple-100">
                  Part {currentPart + 1} of {test.sections.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 bg-white text-[#9C74FF] rounded-lg font-bold hover:bg-purple-50 transition-all shadow-md"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className=" mx-auto p-8">
            {/* Audio Player */}
            {currentSection.audioUrl && (
              <div className="bg-white rounded-xl shadow-md px-4 py-3 mb-4 border border-purple-200 sticky top-0 z-30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-[#9C74FF] rounded-lg">
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Audio
                    </h3>
                  </div>
                </div>
                <audio ref={audioRef} src={currentSection.audioUrl} />
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded appearance-none cursor-pointer mb-1 bg-gray-200 accent-[#9C74FF]"
                />
                <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                  <span>{formatTime(Math.floor(currentTime))}</span>
                  <span>{formatTime(Math.floor(duration))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={restartAudio}
                      className="p-2 rounded-lg hover:bg-purple-100 text-[#9C74FF]"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-lg bg-[#9C74FF] text-white shadow"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={toggleMute}>
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 rounded cursor-pointer accent-[#9C74FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Questions Section */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 overflow-hidden">
              <div className="p-8">
                <div className="space-y-6">
                  {(() => {
                    const questions = currentSection.questions;
                    const processedQuestions = new Set<number>();
                    const elements: JSX.Element[] = [];

                    const isNoteType = (type: string) =>
                      [
                        "sentence-completion",
                        "note-completion",
                        "form-completion",
                        "summary-completion",
                        "table-completion",
                        "flow-chart",
                      ].includes(type);

                    const isMapType = (q: any) =>
                      q.questionType === "plan-map-diagram" && q.imageUrl;

                    for (let i = 0; i < questions.length; i++) {
                      const q = questions[i];

                      // 1. MAP QUESTIONS
                      // 1) MAP GROUP
                      if (isMapType(q)) {
                        const mapGroup: any[] = [q];
                        processedQuestions.add(i);
                        const currentImageUrl = q.imageUrl;

                        for (let j = i + 1; j < questions.length; j++) {
                          const nextQ = questions[j];
                          if (
                            nextQ.questionType === "plan-map-diagram" &&
                            nextQ.imageUrl === currentImageUrl
                          ) {
                            mapGroup.push(nextQ);
                            processedQuestions.add(j);
                            i = j;
                          } else break;
                        }

                        const startQ = mapGroup[0].questionNumber;
                        const endQ =
                          mapGroup[mapGroup.length - 1].questionNumber;

                        elements.push(
                          <div key={`map-group-${startQ}`}>
                            <div className="p-6 bg-linear-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-[#9C74FF]/30 shadow-xl">
                              {/* HEADER */}
                              <div className="mb-6 pb-4 border-b border-purple-200">
                                <h3 className="text-xl font-bold text-[#9C74FF] mb-2 uppercase">
                                  Questions {startQ}-{endQ}
                                </h3>
                                <p className="text-sm text-gray-700">
                                  Label the plan below. Write the correct letter
                                  next to Questions {startQ}-{endQ}.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image */}
                                <div className="lg:sticky lg:top-24 lg:self-start">
                                  <img
                                    src={currentImageUrl}
                                    alt="Map"
                                    className="w-full h-auto rounded-lg border-2 border-purple-300 shadow-md"
                                  />
                                </div>

                                {/* Questions */}
                                <div className="space-y-3">
                                  {mapGroup.map((mq: any) => (
                                    <div
                                      id={`q-${mq.questionNumber}`}
                                      key={mq.questionNumber}
                                      className="group relative bg-white p-4 rounded-xl border border-purple-200 scroll-mt-28"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                          {(() => {
                                            const fullText = mq.contextText
                                              ? `${mq.contextText}\n${mq.question}`
                                              : mq.question;

                                            const blankPattern = /_{2,}/g;

                                            // ✅ BLANK CASE
                                            if (blankPattern.test(fullText)) {
                                              const parts =
                                                fullText.split(blankPattern);
                                              return (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  {parts.map(
                                                    (
                                                      part: string,
                                                      idx: number,
                                                    ) => (
                                                      <React.Fragment key={idx}>
                                                        {part && (
                                                          <span
                                                            className="cursor-text"
                                                            onMouseUp={(e) =>
                                                              handleTextSelection(
                                                                e,
                                                                `map-${mq.questionNumber}-part-${idx}`,
                                                              )
                                                            }
                                                          >
                                                            {renderTextWithHighlights(
                                                              part,
                                                              `map-${mq.questionNumber}-part-${idx}`,
                                                            )}
                                                          </span>
                                                        )}

                                                        {idx <
                                                          parts.length - 1 && (
                                                          <span className="inline-flex items-center gap-1 group">
                                                            {/* BOOKMARK */}
                                                            <button
                                                              onClick={() =>
                                                                toggleFlag(
                                                                  mq.questionNumber,
                                                                )
                                                              }
                                                              className={`transition-opacity ${
                                                                flaggedQuestions.has(
                                                                  mq.questionNumber,
                                                                )
                                                                  ? "opacity-100"
                                                                  : "opacity-0 group-hover:opacity-100"
                                                              }`}
                                                            >
                                                              <Bookmark
                                                                size={14}
                                                                className={
                                                                  flaggedQuestions.has(
                                                                    mq.questionNumber,
                                                                  )
                                                                    ? "fill-purple-500 text-purple-500"
                                                                    : "text-gray-400 hover:text-purple-500"
                                                                }
                                                              />
                                                            </button>

                                                            {/* INPUT */}
                                                            <input
                                                              type="text"
                                                              placeholder={`${mq.questionNumber}`}
                                                              className="inline-block bg-transparent border border-gray-400 rounded-md focus:border-gray-600 focus:ring-0 min-w-20 max-w-40 px-1 py-1 text-sm text-center text-gray-800 placeholder-gray-400 font-medium"
                                                              value={
                                                                answers[
                                                                  mq
                                                                    .questionNumber
                                                                ] || ""
                                                              }
                                                              onChange={(e) =>
                                                                handleAnswerChange(
                                                                  mq.questionNumber,
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                            />

                                                            {/* ✅ NOTES ICON (MAP) */}
                                                            <div
                                                              className={`transition-opacity ${
                                                                notes[
                                                                  mq
                                                                    .questionNumber
                                                                ]
                                                                  ? "opacity-100"
                                                                  : "opacity-0 group-hover:opacity-100"
                                                              }`}
                                                            >
                                                              <QuestionNotes
                                                                questionNumber={
                                                                  mq.questionNumber
                                                                }
                                                                initialNote={
                                                                  notes[
                                                                    mq
                                                                      .questionNumber
                                                                  ] || ""
                                                                }
                                                                onSaveNote={
                                                                  handleSaveNote
                                                                }
                                                              />
                                                            </div>
                                                          </span>
                                                        )}
                                                      </React.Fragment>
                                                    ),
                                                  )}
                                                </div>
                                              );
                                            }

                                            // ✅ NON-BLANK CASE
                                            return (
                                              <div className="flex items-center gap-3 group">
                                                <p
                                                  className="text-gray-800 font-medium text-sm cursor-text"
                                                  onMouseUp={(e) =>
                                                    handleTextSelection(
                                                      e,
                                                      `map-${mq.questionNumber}-text`,
                                                    )
                                                  }
                                                >
                                                  {renderTextWithHighlights(
                                                    fullText,
                                                    `map-${mq.questionNumber}-text`,
                                                  )}
                                                </p>

                                                <span className="font-bold text-gray-900 text-sm">
                                                  {mq.questionNumber}.
                                                </span>

                                                {/* BOOKMARK */}
                                                <button
                                                  onClick={() =>
                                                    toggleFlag(
                                                      mq.questionNumber,
                                                    )
                                                  }
                                                  className={`transition-opacity ${
                                                    flaggedQuestions.has(
                                                      mq.questionNumber,
                                                    )
                                                      ? "opacity-100"
                                                      : "opacity-0 group-hover:opacity-100"
                                                  }`}
                                                >
                                                  <Bookmark
                                                    size={14}
                                                    className={
                                                      flaggedQuestions.has(
                                                        mq.questionNumber,
                                                      )
                                                        ? "fill-purple-500 text-purple-500"
                                                        : "text-gray-400 hover:text-purple-500"
                                                    }
                                                  />
                                                </button>

                                                {/* INPUT */}
                                                <input
                                                  type="text"
                                                  placeholder={`${mq.questionNumber}`}
                                                  className="inline-block bg-transparent border border-gray-400 rounded-md focus:border-gray-600 focus:ring-0 min-w-20 max-w-40 px-2 py-1 text-sm text-center text-gray-800 placeholder-gray-400 font-medium"
                                                  value={
                                                    answers[
                                                      mq.questionNumber
                                                    ] || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleAnswerChange(
                                                      mq.questionNumber,
                                                      e.target.value,
                                                    )
                                                  }
                                                />

                                                {/* ✅ NOTES ICON (MAP else ham) */}
                                                <div
                                                  className={`transition-opacity ${
                                                    notes[mq.questionNumber]
                                                      ? "opacity-100"
                                                      : "opacity-0 group-hover:opacity-100"
                                                  }`}
                                                >
                                                  <QuestionNotes
                                                    questionNumber={
                                                      mq.questionNumber
                                                    }
                                                    initialNote={
                                                      notes[
                                                        mq.questionNumber
                                                      ] || ""
                                                    }
                                                    onSaveNote={handleSaveNote}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>,
                        );
                      }

                      // 2) NOTE/FORM/SENTENCE QUESTIONS
                      else if (isNoteType(q.questionType)) {
                        const noteGroup: any[] = [q];
                        processedQuestions.add(i);

                        for (let j = i + 1; j < questions.length; j++) {
                          const nextQ = questions[j];
                          if (isNoteType(nextQ.questionType)) {
                            noteGroup.push(nextQ);
                            processedQuestions.add(j);
                            i = j;
                          } else break;
                        }

                        const startQ = noteGroup[0].questionNumber;
                        const endQ =
                          noteGroup[noteGroup.length - 1].questionNumber;

                        elements.push(
                          <div key={`note-group-${startQ}`}>
                            <div className="bg-white border-2 border-gray-400 rounded-lg shadow-lg p-8 mb-8 relative font-serif text-gray-900">
                              {/* HEADER */}
                              <div className="text-center border-b-2 border-gray-800 pb-3 mb-6">
                                <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-900 mb-2">
                                  {currentSection.title}
                                </h2>
                                <p className="text-lg font-bold text-gray-800">
                                  Questions {startQ}-{endQ}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  Complete the notes below. Write{" "}
                                  <b>NO MORE THAN ONE WORD AND/OR A NUMBER</b>{" "}
                                  for each answer.
                                </p>
                              </div>

                              <div>
                                {noteGroup.map((nq: any) => {
                                  const questionText = nq.question;
                                  const numberMatch =
                                    questionText.match(/^(\d+)\.\s*/);
                                  let numberPart = null;
                                  let textPart = questionText;

                                  if (numberMatch) {
                                    numberPart = numberMatch[1];
                                    textPart = questionText.substring(
                                      numberMatch[0].length,
                                    );
                                  }

                                  return (
                                    <div
                                      id={`q-${nq.questionNumber}`}
                                      key={nq.questionNumber}
                                      className="relative group/item scroll-mt-28"
                                    >
                                      {/* CONTEXT */}
                                      {nq.contextText && (
                                        <div
                                          className="text-gray-800 text-lg whitespace-pre-wrap font-medium cursor-text"
                                          onMouseUp={(e) =>
                                            handleTextSelection(
                                              e,
                                              `context-${nq.questionNumber}`,
                                            )
                                          }
                                        >
                                          {renderTextWithHighlights(
                                            nq.contextText,
                                            `context-${nq.questionNumber}`,
                                          )}
                                        </div>
                                      )}

                                      {/* QUESTION LINE */}
                                      <div className="flex items-start gap-4 leading-loose text-lg">
                                        {numberPart && (
                                          <span className="font-bold min-w-[35px] pt-1 shrink-0">
                                            {numberPart}.
                                          </span>
                                        )}

                                        <div className="flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                          {(() => {
                                            const blankPattern = /_{2,}/g;
                                            const hasBlanks =
                                              blankPattern.test(textPart);

                                            if (hasBlanks) {
                                              const parts =
                                                textPart.split(blankPattern);
                                              return (
                                                <>
                                                  {parts.map(
                                                    (
                                                      part: string,
                                                      idx: number,
                                                    ) => (
                                                      <React.Fragment key={idx}>
                                                        {part && (
                                                          <span
                                                            className="font-medium whitespace-pre-wrap cursor-text"
                                                            onMouseUp={(e) =>
                                                              handleTextSelection(
                                                                e,
                                                                `question-${nq.questionNumber}-part-${idx}`,
                                                              )
                                                            }
                                                          >
                                                            {renderTextWithHighlights(
                                                              part,
                                                              `question-${nq.questionNumber}-part-${idx}`,
                                                            )}
                                                          </span>
                                                        )}

                                                        {idx <
                                                          parts.length - 1 && (
                                                          <span className="inline-flex items-center gap-1 group">
                                                            {/* BOOKMARK */}
                                                            <button
                                                              onClick={() =>
                                                                toggleFlag(
                                                                  nq.questionNumber,
                                                                )
                                                              }
                                                              className={`transition-opacity ${
                                                                flaggedQuestions.has(
                                                                  nq.questionNumber,
                                                                )
                                                                  ? "opacity-100"
                                                                  : "opacity-0 group-hover/item:opacity-100"
                                                              }`}
                                                            >
                                                              <Bookmark
                                                                size={14}
                                                                className={
                                                                  flaggedQuestions.has(
                                                                    nq.questionNumber,
                                                                  )
                                                                    ? "fill-purple-500 text-purple-500"
                                                                    : "text-gray-400 hover:text-purple-500"
                                                                }
                                                              />
                                                            </button>

                                                            {/* INPUT */}
                                                            <input
                                                              type="text"
                                                              placeholder={`${nq.questionNumber}`}
                                                              className="inline-block bg-transparent border border-gray-400 rounded-md focus:border-gray-600 focus:ring-0 min-w-20 max-w-40 px-1 py-1 text-sm text-center text-gray-800 placeholder-gray-400 font-medium"
                                                              value={
                                                                answers[
                                                                  nq
                                                                    .questionNumber
                                                                ] || ""
                                                              }
                                                              onChange={(e) =>
                                                                handleAnswerChange(
                                                                  nq.questionNumber,
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                            />

                                                            {/* ✅ NOTES ICON (NOTE) */}
                                                            <div
                                                              className={`transition-opacity ${
                                                                notes[
                                                                  nq
                                                                    .questionNumber
                                                                ]
                                                                  ? "opacity-100"
                                                                  : "opacity-0 group-hover/item:opacity-100"
                                                              }`}
                                                            >
                                                              <QuestionNotes
                                                                questionNumber={
                                                                  nq.questionNumber
                                                                }
                                                                initialNote={
                                                                  notes[
                                                                    nq
                                                                      .questionNumber
                                                                  ] || ""
                                                                }
                                                                onSaveNote={
                                                                  handleSaveNote
                                                                }
                                                              />
                                                            </div>
                                                          </span>
                                                        )}
                                                      </React.Fragment>
                                                    ),
                                                  )}
                                                </>
                                              );
                                            }

                                            return (
                                              <span
                                                className="font-medium cursor-text"
                                                onMouseUp={(e) =>
                                                  handleTextSelection(
                                                    e,
                                                    `question-${nq.questionNumber}-full`,
                                                  )
                                                }
                                              >
                                                {renderTextWithHighlights(
                                                  textPart,
                                                  `question-${nq.questionNumber}-full`,
                                                )}
                                              </span>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>,
                        );
                      }

                      // 3) STANDARD QUESTIONS (MCQ)
                      else {
                        processedQuestions.add(i);
                        elements.push(
                          <div
                            id={`q-${q.questionNumber}`}
                            key={q.questionNumber}
                            className="scroll-mt-28"
                          >
                            <div className="group relative bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-[#9C74FF] transition-all mb-4">
                              <div className="flex gap-4">
                                <div className="flex items-start gap-2 shrink-0">
                                  <span className="font-bold text-gray-900 text-lg">
                                    {q.questionNumber}.
                                  </span>
                                  <div
                                    className={`mt-1 transition-all ${
                                      notes[q.questionNumber]
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    }`}
                                  >
                                    <QuestionNotes
                                      questionNumber={q.questionNumber}
                                      initialNote={
                                        notes[q.questionNumber] || ""
                                      }
                                      onSaveNote={handleSaveNote}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <p
                                    className="text-gray-800 mb-3 font-medium cursor-text"
                                    onMouseUp={(e) =>
                                      handleTextSelection(
                                        e,
                                        `question-${q.questionNumber}-std`,
                                      )
                                    }
                                  >
                                    {renderTextWithHighlights(
                                      q.question,
                                      `question-${q.questionNumber}-std`,
                                    )}
                                  </p>

                                  {q.questionType === "multiple-choice" &&
                                    q.options && (
                                      <div className="space-y-2">
                                        {q.options.map(
                                          (opt: string, idx: number) => (
                                            <label
                                              key={idx}
                                              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                                                answers[q.questionNumber] ===
                                                opt
                                                  ? "bg-purple-50 border-[#9C74FF]"
                                                  : "border-gray-200 hover:bg-gray-100"
                                              }`}
                                            >
                                              <input
                                                type="radio"
                                                name={`q-${q.questionNumber}`}
                                                value={opt}
                                                checked={
                                                  answers[q.questionNumber] ===
                                                  opt
                                                }
                                                onChange={(e) =>
                                                  handleAnswerChange(
                                                    q.questionNumber,
                                                    e.target.value,
                                                  )
                                                }
                                                className="text-[#9C74FF] focus:ring-[#9C74FF]"
                                              />
                                              <span>{opt}</span>
                                            </label>
                                          ),
                                        )}
                                      </div>
                                    )}

                                  {q.questionType === "matching" &&
                                    q.options && (
                                      <select
                                        className="w-full max-w-md p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9C74FF]"
                                        value={answers[q.questionNumber] || ""}
                                        onChange={(e) =>
                                          handleAnswerChange(
                                            q.questionNumber,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">Select option</option>
                                        {q.options.map(
                                          (opt: string, idx: number) => (
                                            <option key={idx} value={opt}>
                                              {opt}
                                            </option>
                                          ),
                                        )}
                                      </select>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>,
                        );
                      }
                    }
                    return elements;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Modals */}
      <ListeningFooterNav
        test={test}
        testId={testId}
        currentPart={currentPart}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
      />
    </div>
  );
}
