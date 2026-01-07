"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  X,
} from "lucide-react";
import { QuestionNotes } from "../../components/QuestionNotes";

interface Question {
  questionNumber: number;
  questionType: string;
  question: string;
  options?: string[];
  correctAnswer: string;
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
const API_BASE = "/api";
export default function ListeningTestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const testId = params?.id as string;
  const currentPart = parseInt(searchParams?.get("part") || "0");

  const [test, setTest] = useState<ListeningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});

  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

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

  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/listening/${testId}`);
      const result = await response.json();
      if (result.success) {
        setTest(result.data);
        setTimeRemaining(
          result.data.timeLimit ? result.data.timeLimit * 60 : 1800
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
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
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
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
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
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
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
        0
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
    return 1.0; // 0 ta correct
  };

  const handleSubmit = async () => {
    // console.log("🚀 Listening test submit clicked!");
    // console.log("📊 Current answers:", answers);
    // console.log("🆔 Test ID:", testId);

    // Prepare data for backend
    const submitData = {
      testId: testId,
      testType: "listening",
      answers: Object.entries(answers).map(([questionNumber, userAnswer]) => ({
        questionNumber: parseInt(questionNumber),
        userAnswer: userAnswer,
      })),
      timeSpent: test!.timeLimit * 60 - timeRemaining,
    };

    // console.log("📦 Data to submit:", JSON.stringify(submitData, null, 2));

    try {
      // console.log("🔄 Sending request to /api/submit-test...");

      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      // console.log("📡 Response status:", response.status);

      const responseData = await response.json();
      // console.log("✅ Response data:", responseData);

      if (responseData.success) {
        // console.log("🎉 Test submitted successfully!");
        // console.log("📊 Band Score:", responseData.data.bandScore);

        // Calculate local result for display
        const localResult = calculateResult();

        // Merge with backend data
        setResult({
          ...localResult,
          band: responseData.data.bandScore,
          correct: responseData.data.correctAnswers,
          total: responseData.data.totalQuestions,
        });
        setShowResult(true);
      } else {
        console.error("❌ Submission failed:", responseData.error);
        alert("Failed to submit test: " + responseData.error);

        // Fallback to local result
        const localResult = calculateResult();
        setResult(localResult);
        setShowResult(true);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Network error occurred. Showing local results only.");

      // Fallback to local result
      const localResult = calculateResult();
      setResult(localResult);
      setShowResult(true);
    }

    setShowSubmitModal(false);
  };
  const goToNextPart = () => {
    if (currentPart < test!.sections.length - 1) {
      setIsPlaying(false);
      router.push(`/listening/${testId}?part=${currentPart + 1}`);
    }
  };

  const goToPreviousPart = () => {
    if (currentPart > 0) {
      setIsPlaying(false);
      router.push(`/listening/${testId}?part=${currentPart - 1}`);
    }
  };

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
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#9C74FF]" />
                Test Information
              </h3>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Total Questions</p>
                  <p className="font-bold text-gray-900">
                    {test.sections.reduce(
                      (sum: number, s: any) => sum + s.questions.length,
                      0
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
            {/* Header */}
            <div className="bg-[#9C74FF] px-8 py-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Test Results</h2>
              <p className="text-purple-100">{test.testName}</p>
            </div>

            {/* Score Summary */}
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
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      Correct
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {result.correct}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border-2 border-red-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">
                      Incorrect
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {result.incorrect}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      Unanswered
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-600">
                    {result.unanswered}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Answer Review
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.details.map((detail: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      detail.isCorrect
                        ? "bg-green-50 border-green-200"
                        : detail.userAnswer === "Not answered"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
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
                              className={`font-medium ${
                                detail.userAnswer === "Not answered"
                                  ? "text-gray-500 italic"
                                  : detail.isCorrect
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
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
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-purple-50 px-8 py-6 flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-white border-2 border-[#9C74FF] text-[#9C74FF] rounded-xl font-semibold hover:bg-purple-50 transition-all"
              >
                Retake Test
              </button>
              <button
                onClick={() => router.push("/listening")}
                className="flex-1 py-3 bg-[#9C74FF] text-white rounded-xl font-semibold hover:bg-[#8B5FE8] transition-all shadow-md"
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
      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-[#9C74FF]/30">
            {/* Close button */}
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Submit Test?
              </h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to submit? You won't be able to change
                your answers after submission.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-[#9C74FF] text-white rounded-xl font-semibold hover:bg-[#8B5FE8] shadow-md"
                >
                  Submit Test
                </button>
              </div>
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
            {/* Audio Player - AT THE TOP */}
            {currentSection.audioUrl && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-linear-to-br bg-[#9C74FF] rounded-xl">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Audio Player
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentSection.title}
                    </p>
                  </div>
                </div>

                <audio ref={audioRef} src={currentSection.audioUrl} />

                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-linear(to right, #06b6d4 0%, #06b6d4 ${
                        (currentTime / duration) * 100
                      }%, #e0f2fe ${
                        (currentTime / duration) * 100
                      }%, #e0f2fe 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{formatTime(Math.floor(currentTime))}</span>
                    <span>{formatTime(Math.floor(duration))}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={restartAudio}
                      className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl text-[#9C74FF] transition-all"
                      title="Restart"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-linear-to-r bg-[#9C74FF] hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white transition-all shadow-md"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-purple-100 rounded-lg transition-all"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Questions Section */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 overflow-hidden">
              <div className="bg-linear-to-r bg-[#9C74FF] px-8 py-4">
                <h2 className="text-2xl font-bold text-white">
                  {currentSection.title}
                </h2>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {(() => {
                    const questions = currentSection.questions;
                    const processedQuestions = new Set<number>();
                    const elements: JSX.Element[] = [];

                    questions.forEach((question: any, qIdx: number) => {
                      // Skip if already processed
                      if (processedQuestions.has(qIdx)) return;

                      // Check if this is a map/diagram question with image
                      const isMapQuestion =
                        question.questionType === "plan-map-diagram" &&
                        question.imageUrl;

                      if (isMapQuestion) {
                        // Find ALL consecutive map questions with the SAME image
                        const mapGroup: any[] = [question];
                        processedQuestions.add(qIdx);
                        const currentImageUrl = question.imageUrl;

                        // Look ahead for more map questions with same image
                        for (let i = qIdx + 1; i < questions.length; i++) {
                          const nextQ = questions[i];
                          if (
                            nextQ.questionType === "plan-map-diagram" &&
                            nextQ.imageUrl === currentImageUrl
                          ) {
                            mapGroup.push(nextQ);
                            processedQuestions.add(i);
                          } else if (
                            nextQ.questionType !== "plan-map-diagram"
                          ) {
                            // Different question type, stop grouping
                            break;
                          }
                        }

                        // Render instruction banner
                        const showInstruction =
                          qIdx === 0 ||
                          questions[qIdx - 1].questionType !==
                            "plan-map-diagram";
                        const rangeStart = mapGroup[0].questionNumber;
                        const rangeEnd =
                          mapGroup[mapGroup.length - 1].questionNumber;

                        elements.push(
                          <div key={`map-group-${rangeStart}`}>
                            {showInstruction && (
                              <div className="bg-linear-to-r from-purple-50 to-violet-50 border-l-4 border-[#9C74FF] p-3 rounded-r-lg mb-4 shadow-sm">
                                <p className="font-bold text-gray-900 mb-1.5 text-sm">
                                  Questions {rangeStart}-{rangeEnd}
                                </p>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  Label the plan/map/diagram. Write NO MORE THAN
                                  TWO WORDS.
                                </p>
                              </div>
                            )}

                            {/* SIDE-BY-SIDE LAYOUT: LEFT = MAP, RIGHT = ALL QUESTIONS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-[#9C74FF]/30 shadow-xl">
                              {/* LEFT SIDE - MAP IMAGE (STICKY) */}
                              <div className="lg:sticky lg:top-24 lg:self-start">
                                <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-lg">
                                  <div className="flex items-center gap-2 mb-3 pb-3 border-purple-200">
                                    <svg
                                      className="w-6 h-6 text-[#9C74FF]"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                      />
                                    </svg>
                                  </div>
                                  <img
                                    src={currentImageUrl}
                                    alt="Map/Diagram"
                                    className="w-full h-auto rounded-lg border-2 border-purple-300 shadow-md"
                                    onError={(e) => {
                                      const parent =
                                        e.currentTarget.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<div class="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-center"><p class="text-red-800 font-bold text-sm">⚠️ Image Failed to Load</p><p class="text-red-600 text-xs mt-2 break-all">${currentImageUrl}</p></div>`;
                                      }
                                    }}
                                    style={{
                                      maxHeight: "600px",
                                      objectFit: "contain",
                                    }}
                                  />
                                  {mapGroup[0].options?.[0] && (
                                    <div className="mt-3 p-3 bg-purple-100 rounded-lg border-l-4 border-[#9C74FF]">
                                      <p className="text-xs text-purple-900">
                                        <span className="font-bold">
                                          💡 Hint:{" "}
                                        </span>
                                        {mapGroup[0].options[0]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* RIGHT SIDE - ALL QUESTIONS */}
                              <div className="space-y-3">
                                <h3 className="font-bold text-gray-900 text-lg mb-4 pb-3 border-b-2 border-purple-300 flex items-center gap-2">
                                  <span className="text-2xl">📍</span>
                                  Label the following on the map:
                                </h3>
                                {mapGroup.map((q: any) => (
                                  <div
                                    key={q.questionNumber}
                                    className={`group relative rounded-xl p-4 transition-all ${
                                      flaggedQuestions.has(q.questionNumber)
                                        ? "bg-red-50 border-2 border-red-400 shadow-md"
                                        : "bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-[#9C74FF] hover:shadow-md"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Question Number */}
                                      <span className="font-black text-[#9C74FF] text-lg shrink-0 w-8">
                                        {q.questionNumber}.
                                      </span>

                                      <div className="flex items-center map-5">
                                        {/* Flag Button */}
                                        <button
                                          onClick={() =>
                                            toggleFlag(q.questionNumber)
                                          }
                                          className={`shrink-0 transition-all ${
                                            flaggedQuestions.has(
                                              q.questionNumber
                                            )
                                              ? "opacity-100"
                                              : "opacity-0 group-hover:opacity-100"
                                          }`}
                                        >
                                          <Flag
                                            size={16}
                                            className={
                                              flaggedQuestions.has(
                                                q.questionNumber
                                              )
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-400 hover:text-red-500"
                                            }
                                          />
                                        </button>
                                        {/* Note */}
                                        <div
                                          className={`mt-1 transition-all ${
                                            notes[question.questionNumber]
                                              ? "opacity-100"
                                              : "opacity-0 group-hover:opacity-100"
                                          }`}
                                        >
                                          <QuestionNotes
                                            questionNumber={
                                              question.questionNumber
                                            }
                                            initialNote={
                                              notes[question.questionNumber] ||
                                              ""
                                            }
                                            onSaveNote={handleSaveNote}
                                          />
                                        </div>
                                      </div>

                                      {/* Question & Answer */}
                                      <div className="flex-1 flex items-center gap-3">
                                        <p className="text-gray-800 font-medium text-base shrink-0">
                                          {q.question}
                                        </p>
                                        <input
                                          type="text"
                                          className="flex-1 border rounded mb-2 min-w-[200px] max-w-xs px-3 py-1.5 border-b-2 border-gray-300 focus:outline-none focus:border-[#9C74FF] text-gray-800 font-medium text-sm bg-transparent transition-colors"
                                          placeholder="Your answer"
                                          value={
                                            answers[question.questionNumber] ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleAnswerChange(
                                              question.questionNumber,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // REGULAR QUESTION (NOT MAP/DIAGRAM)
                        processedQuestions.add(qIdx);

                        // Check if instruction needed
                        const showInstruction =
                          qIdx === 0 ||
                          questions[qIdx - 1].questionType !==
                            question.questionType;
                        let rangeStart = question.questionNumber;
                        let rangeEnd = question.questionNumber;

                        if (showInstruction) {
                          for (let i = qIdx + 1; i < questions.length; i++) {
                            if (
                              questions[i].questionType ===
                              question.questionType
                            ) {
                              rangeEnd = questions[i].questionNumber;
                            } else {
                              break;
                            }
                          }
                        }

                        const instructions: { [key: string]: string } = {
                          "multiple-choice":
                            "Choose the correct letter: A, B, C, or D.",
                          "form-completion":
                            "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
                          "note-completion":
                            "Complete the notes below. Write ONE WORD ONLY.",
                          matching:
                            "Match each statement with the correct option.",
                          "short-answer":
                            "Answer the questions. Write NO MORE THAN THREE WORDS.",
                          "table-completion":
                            "Complete the table below. Write ONE WORD AND/OR A NUMBER.",
                          "flow-chart":
                            "Complete the flow-chart. Write NO MORE THAN TWO WORDS.",
                          "summary-completion":
                            "Complete the summary. Write ONE WORD ONLY.",
                          "sentence-completion":
                            "Complete the sentences. Write NO MORE THAN TWO WORDS.",
                        };

                        elements.push(
                          <div key={question.questionNumber}>
                            {showInstruction && (
                              <div className="bg-linear-to-r from-purple-50 to-violet-50 border-l-4 border-[#9C74FF] p-3 rounded-r-lg mb-4 shadow-sm">
                                <p className="font-bold text-gray-900 mb-1.5 text-sm">
                                  Questions {rangeStart}-{rangeEnd}
                                </p>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {instructions[question.questionType] ||
                                    "Read the instructions carefully."}
                                </p>
                              </div>
                            )}

                            <div
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
                                      flaggedQuestions.has(
                                        question.questionNumber
                                      )
                                        ? "opacity-100 scale-110"
                                        : "opacity-0 group-hover:opacity-100"
                                    }`}
                                  >
                                    <Flag
                                      size={18}
                                      className={
                                        flaggedQuestions.has(
                                          question.questionNumber
                                        )
                                          ? "fill-red-500 text-red-500 drop-shadow-md"
                                          : "text-gray-400 hover:text-red-500"
                                      }
                                    />
                                  </button>
                                  <div
                                    className={`mt-1 transition-all ${
                                      notes[question.questionNumber]
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    }`}
                                  >
                                    <QuestionNotes
                                      questionNumber={question.questionNumber}
                                      initialNote={
                                        notes[question.questionNumber] || ""
                                      }
                                      onSaveNote={handleSaveNote}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  {/* Inline input for text-based questions */}
                                  {question.questionType ===
                                    "form-completion" ||
                                  question.questionType === "note-completion" ||
                                  question.questionType === "short-answer" ||
                                  question.questionType ===
                                    "table-completion" ||
                                  question.questionType === "flow-chart" ||
                                  question.questionType ===
                                    "summary-completion" ||
                                  question.questionType ===
                                    "sentence-completion" ? (
                                    <div className="flex items-center gap-3 mb-4">
                                      <p className="text-gray-800 leading-relaxed shrink-0">
                                        {question.question}
                                      </p>
                                      <input
                                        type="text"
                                        className="flex-1 border rounded mb-2 min-w-[200px] max-w-xs px-3 py-1.5 border-b-2 border-gray-300 focus:outline-none focus:border-[#9C74FF] text-gray-800 font-medium text-sm bg-transparent transition-colors"
                                        placeholder="Your answer"
                                        value={
                                          answers[question.questionNumber] || ""
                                        }
                                        onChange={(e) =>
                                          handleAnswerChange(
                                            question.questionNumber,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-gray-800 mb-4 leading-relaxed">
                                      {question.question}
                                    </p>
                                  )}

                                  {/* Image for non-map questions */}
                                  {question.imageUrl &&
                                    question.questionType !==
                                      "plan-map-diagram" && (
                                      <div className="mb-4">
                                        <img
                                          src={question.imageUrl}
                                          alt="Question reference"
                                          className="w-full max-w-md rounded-lg border-2 border-gray-200"
                                        />
                                      </div>
                                    )}

                                  {/* Multiple Choice */}
                                  {question.questionType ===
                                    "multiple-choice" &&
                                    question.options && (
                                      <div className="space-y-2">
                                        {question.options.map(
                                          (option: string, idx: number) => (
                                            <label
                                              key={idx}
                                              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                answers[
                                                  question.questionNumber
                                                ] === option
                                                  ? "bg-purple-50 border-[#9C74FF] shadow-md"
                                                  : "border-gray-200 hover:border-[#9C74FF]/50 hover:bg-purple-50/30"
                                              }`}
                                            >
                                              <input
                                                type="radio"
                                                name={`question-${question.questionNumber}`}
                                                value={option}
                                                checked={
                                                  answers[
                                                    question.questionNumber
                                                  ] === option
                                                }
                                                onChange={(e) =>
                                                  handleAnswerChange(
                                                    question.questionNumber,
                                                    e.target.value
                                                  )
                                                }
                                                className="w-4 h-4 text-[#9C74FF] focus:ring-2 focus:ring-[#9C74FF]"
                                              />
                                              <span className="text-gray-800 font-medium text-sm">
                                                {option}
                                              </span>
                                            </label>
                                          )
                                        )}
                                      </div>
                                    )}

                                  {/* Matching */}
                                  {question.questionType === "matching" &&
                                    question.options && (
                                      <select
                                        className="w-full max-w-md px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C74FF] text-gray-800 font-medium bg-white text-sm"
                                        value={
                                          answers[question.questionNumber] || ""
                                        }
                                        onChange={(e) =>
                                          handleAnswerChange(
                                            question.questionNumber,
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="">
                                          Select an answer
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
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    });

                    return elements;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t-2 border-purple-100 shrink-0 shadow-lg  z-30 fixed bottom-0 w-full">
        <div className="max-w-full mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {test.sections.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    router.push(`/listening/${testId}?part=${idx}`);
                  }}
                  className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    idx === currentPart
                      ? "bg-linear-to-r bg-[#9C74FF] text-white shadow-md"
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
                disabled={currentPart === test.sections.length - 1}
                className="px-6 py-1.5 bg-linear-to-r bg-[#9C74FF] text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold shadow-md transition-all"
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
