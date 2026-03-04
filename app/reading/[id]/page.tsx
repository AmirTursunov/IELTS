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
  Info,
  Bookmark,
  NotebookPenIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import ReviewModal from "@/app/components/TestReview";
// TextFormatter Component
interface TextFormatterProps {
  text: string;
  className?: string;
}
interface Match {
  type: "bold" | "italic" | "underline" | "bold-italic";
  start: number;
  end: number;
  text: string;
}
const TextFormatter: React.FC<TextFormatterProps> = ({
  text,
  className = "",
}) => {
  if (!text) return null;

  // INDENT FORMAT (1r, 2r, 3r...)
  const indentRegex = /^(\d+)r\s*/;
  const indentMatch = text.match(indentRegex);

  let indentRem = 0;
  let processedText = text;

  if (indentMatch) {
    indentRem = Number(indentMatch[1]);
    processedText = text.replace(indentRegex, "");
  }

  const allMatches: Match[] = [];
  let match: RegExpExecArray | null;

  // BOLD-ITALIC (***...***)
  const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
  while ((match = boldItalicRegex.exec(processedText)) !== null) {
    allMatches.push({
      type: "bold-italic",
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // BOLD (**...**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  while ((match = boldRegex.exec(processedText)) !== null) {
    const overlaps = allMatches.some(
      (m) => match!.index >= m.start && match!.index < m.end,
    );

    if (!overlaps) {
      allMatches.push({
        type: "bold",
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      });
    }
  }

  // ITALIC (*...*)
  const italicRegex = /\*(.*?)\*/g;
  while ((match = italicRegex.exec(processedText)) !== null) {
    const overlaps = allMatches.some(
      (m) => match!.index >= m.start && match!.index < m.end,
    );

    if (!overlaps) {
      allMatches.push({
        type: "italic",
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      });
    }
  }

  // UNDERLINE (__...__)
  const underlineRegex = /__(.*?)__/g;
  while ((match = underlineRegex.exec(processedText)) !== null) {
    const overlaps = allMatches.some(
      (m) => match!.index >= m.start && match!.index < m.end,
    );

    if (!overlaps) {
      allMatches.push({
        type: "underline",
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      });
    }
  }

  // Sort matches
  allMatches.sort((a, b) => a.start - b.start);

  let currentIndex = 0;
  const result: React.ReactNode[] = [];

  allMatches.forEach((m, idx) => {
    if (m.start > currentIndex) {
      result.push(
        <React.Fragment key={`text-${currentIndex}`}>
          {processedText.slice(currentIndex, m.start)}
        </React.Fragment>,
      );
    }

    switch (m.type) {
      case "bold":
        result.push(<strong key={`match-${idx}`}>{m.text}</strong>);
        break;

      case "italic":
        result.push(<em key={`match-${idx}`}>{m.text}</em>);
        break;

      case "underline":
        result.push(<u key={`match-${idx}`}>{m.text}</u>);
        break;

      case "bold-italic":
        result.push(
          <strong key={`match-${idx}`}>
            <em>{m.text}</em>
          </strong>,
        );
        break;
    }

    currentIndex = m.end;
  });

  if (currentIndex < processedText.length) {
    result.push(
      <React.Fragment key={`text-${currentIndex}`}>
        {processedText.slice(currentIndex)}
      </React.Fragment>,
    );
  }

  return (
    <span className={className} style={{ marginLeft: `${indentRem}rem` }}>
      {result}
    </span>
  );
};

const API_BASE = "/api";

export default function ReadingTestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session } = useSession();
  const testId = params?.id as string;
  const currentPart = parseInt(searchParams?.get("part") || "0");

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const questionContainerRef = useRef<HTMLDivElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [highlights, setHighlights] = useState<{
    [key: string]: {
      start: number;
      end: number;
      color: string;
      note?: string;
    }[];
  }>({});

  const [sel, setSel] = useState<{
    text: string;
    start: number;
    end: number;
    clientX: number;
    clientY: number;
    context: "passage" | "question";
  } | null>(null);

  const [noteModal, setNoteModal] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);

  // Text selection - FAQAT passage uchun
  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      const passageContainer = passageContainerRef.current;

      // FAQAT passage ichida
      if (!passageContainer?.contains(e.target as Node)) {
        return;
      }

      const container = passageContainer.querySelector(".passage-content");
      if (!container) return;

      const s = window.getSelection();
      if (!s || s.rangeCount === 0 || s.isCollapsed) return;

      const text = s.toString().trim();
      if (!text || text.length < 2) return;

      const r = s.getRangeAt(0);
      const pre = r.cloneRange();
      pre.selectNodeContents(container);
      pre.setEnd(r.startContainer, r.startOffset);
      const start = pre.toString().length;
      const end = start + text.length;

      const rect = r.getBoundingClientRect();
      setSel({
        text,
        start,
        end,
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom + window.scrollY + 5,
        context: "passage",
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      // Agar menu yoki note modal'ga bosilmasa - yopish
      const target = e.target as HTMLElement;
      if (
        !target.closest(".highlight-menu") &&
        !target.closest(".note-modal")
      ) {
        setSel(null);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
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
          result.data.timeLimit ? result.data.timeLimit * 60 : 3600,
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
    const submitData = {
      testId: testId,
      testType: "reading",
      answers: Object.entries(answers).map(([questionNumber, userAnswer]) => ({
        questionNumber: parseInt(questionNumber),
        userAnswer: userAnswer,
      })),
      timeSpent: test.timeLimit * 60 - timeRemaining,
    };

    try {
      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        const localResult = calculateResult();
        setResult({
          ...localResult,
          score: responseData.data.bandScore,
          correct: responseData.data.correctAnswers,
          total: responseData.data.totalQuestions,
        });
        setShowResult(true);
      } else {
        alert("Failed to submit test: " + responseData.error);
        const localResult = calculateResult();
        setResult(localResult);
        setShowResult(true);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Network error occurred. Showing local results only.");
      const localResult = calculateResult();
      setResult(localResult);
      setShowResult(true);
    }

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

  useEffect(() => {
    if (questionContainerRef.current) {
      questionContainerRef.current.scrollTop = 0;
    }
    if (passageContainerRef.current) {
      passageContainerRef.current.scrollTop = 0;
    }
  }, [currentPart]);

  // Convert number to Roman numerals for headings
  const toRoman = (num: number): string => {
    const romanNumerals: [number, string][] = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];

    let result = "";
    for (const [value, numeral] of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result.toLowerCase(); // i, ii, iii instead of I, II, III
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
          // Collect unique options for matching types
          allOptions: question.options || [],
        };
      } else {
        currentGroup.end = question.questionNumber;
        currentGroup.questions.push(question);
        // For matching types, we usually have same options for all questions in group
        if (question.options && currentGroup.allOptions.length === 0) {
          currentGroup.allOptions = question.options;
        }
      }
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const renderInstructions = (
    type: string,
    start: number,
    end: number,
    questions?: any[],
  ) => {
    // Birinchi question'dan instruction olish (group level)
    const customInstruction = questions?.[0]?.instruction;

    // Default instructions (fallback)
    const defaultInstructions: {
      [key: string]: { title: string; text: string };
    } = {
      "multiple-choice": {
        title: `Questions ${start}-${end}`,
        text: "Choose the correct letter: A, B, C, or D.",
      },
      "true-false-not-given": {
        title: `Questions ${start}-${end}`,
        text: "Do the following statements agree with the information given in Reading Passage?\nIn boxes on your answer sheet, write\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
      },
      "yes-no-not-given": {
        title: `Questions ${start}-${end}`,
        text: "Do the following statements agree with the views/claims of the writer in Reading Passage?\nIn boxes on your answer sheet, write\nYES if the statement agrees with the views/claims of the writer\nNO if the statement contradicts the views/claims of the writer\nNOT GIVEN if it is impossible to say what the writer thinks about this",
      },
      matching: {
        title: `Questions ${start}-${end}`,
        text: "Match each statement with the correct option.",
      },
      "matching-headings": {
        title: `Questions ${start}-${end}`,
        text: "The reading passage has several paragraphs. Choose the correct heading for each paragraph from the list of headings below.",
      },
      "matching-headings-drag-drop": {
        title: `Questions ${start}-${end}`,
        text: "The passage has several paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below by dragging and dropping.",
      },
      "matching-sentence-endings": {
        title: `Questions ${start}-${end}`,
        text: "Complete each sentence with the correct ending, A-H, below.",
      },
      "matching-features": {
        title: `Questions ${start}-${end}`,
        text: "Match each statement with the correct person/date/place. You may use any letter more than once.",
      },
      "matching-information": {
        title: `Questions ${start}-${end}`,
        text: "The reading passage has several paragraphs, A-F. Which paragraph contains the following information?",
      },
      "summary-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
      },
      "summary-completion-box": {
        title: `Questions ${start}-${end}`,
        text: "Complete the summary below. Choose ONE WORD ONLY from the box for each answer.",
      },
      "summary-completion-with-text": {
        title: `Questions ${start}-${end}`,
        text: "Complete the summary using the list of words, A-K, below.",
      },
      "note-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      },
      "table-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the table below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      },
      "flow-chart-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the flow-chart below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
      },
      "diagram-labeling": {
        title: `Questions ${start}-${end}`,
        text: "Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
      },
      "sentence-completion": {
        title: `Questions ${start}-${end}`,
        text: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      },
      "short-answer": {
        title: `Questions ${start}-${end}`,
        text: "Answer the questions below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
      },
    };

    // Custom instruction bor bo'lsa - ishlatish, yo'q bo'lsa - default
    const defaultInstruction = defaultInstructions[type] || {
      title: `Questions ${start}-${end}`,
      text: "Read the instructions carefully.",
    };

    return (
      <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg mb-4 shadow-sm">
        <p className="font-bold text-gray-900 mb-1.5 text-sm">
          {defaultInstruction.title}
        </p>
        <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {customInstruction || defaultInstruction.text}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-purple-100">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-4">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push("/reading")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!test || !test.passages || test.passages.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Test not found</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-purple-100 to-purple-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-purple-100">
            <div className="text-center mb-8">
              <div className="bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-3xl inline-block mb-6 shadow-lg">
                IELTS READING
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                {test.title}
              </h1>
              <p className="text-gray-500 text-lg">Academic Reading Test</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-linear-to-br from-purple-50 to-purple-50 p-6 rounded-xl text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {test.passages.length}
                </div>
                <div className="text-gray-600 font-medium text-sm">
                  Passages
                </div>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
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

            <div className="bg-linear-to-r from-purple-50 to-purple-50 border-l-4 border-purple-500 rounded-r-xl p-5 mb-8">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  i
                </span>
                Test Instructions
              </h3>
              <ul className="text-sm text-purple-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>
                    Read each passage carefully before answering questions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Click the flag icon to mark questions for review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Use navigation buttons to move between passages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Timer will start when you click "Start Test"</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setTestStarted(true)}
              className="w-full bg-linear-to-r from-purple-500 to-purple-600 text-white py-5 rounded-xl font-bold text-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-3"
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
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-purple-100 to-purple-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="bg-linear-to-r from-purple-500 via-purple-600 to-indigo-600 p-10 text-white">
              <h1 className="text-4xl font-bold mb-3">Test Completed!</h1>
              <p className="text-purple-100 text-lg">
                IELTS Reading Test - {test.title}
              </p>
            </div>

            <div className="p-10 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-6xl font-bold mb-2">
                      {result.score}
                    </div>
                    <p className="font-semibold text-purple-100">Band Score</p>
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
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-50 to-purple-50 px-6 py-3 rounded-full border border-purple-200">
                  <Clock size={20} className="text-purple-600" />
                  <span className="text-gray-700 font-medium">
                    Time: {formatTime(result.timeTaken)} /{" "}
                    {formatTime(test.timeLimit * 60)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-linear-to-b from-purple-500 to-purple-600 rounded-full"></div>
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
                onClick={() => setReviewOpen(true)}
                className="px-10 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Back to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Retake Test
              </button>
            </div>
            {reviewOpen && (
              <ReviewModal
                isOpen={reviewOpen}
                onClose={() => {
                  setReviewOpen(false);
                  router.push("/reading");
                }}
                testId={String(testId)}
                userId={session?.user?.id || "anonymous"}
                testType="reading"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const HIGHLIGHT_COLORS = [
    {
      name: "yellow",
      bg: "bg-yellow-300",
      hover: "hover:bg-yellow-400",
      border: "border-yellow-400",
    },
    {
      name: "purple",
      bg: "bg-purple-300",
      hover: "hover:bg-purple-400",
      border: "border-purple-400",
    },
    {
      name: "fuchsia",
      bg: "bg-fuchsia-300",
      hover: "hover:bg-fuchsia-400",
      border: "border-fuchsia-400",
    },
  ];

  const renderHighlighted = (text: string, contextKey: string) => {
    const contextHighlights = highlights[contextKey] || [];

    let last = 0;
    const nodes: JSX.Element[] = [];
    const sorted = [...contextHighlights].sort((a, b) => a.start - b.start);

    sorted.forEach((h, i) => {
      const before = text.slice(last, h.start);
      const body = text.slice(h.start, h.end);
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
        </span>,
      );
      last = h.end;
    });

    nodes.push(<span key="tail">{text.slice(last)}</span>);
    return <>{nodes}</>;
  };

  // Render question text with inline inputs
  const renderQuestionText = (question: any) => {
    const questionText = question.question;
    const hasUnderscore = /_{2,}/g.test(questionText);
    const isFlagged = flaggedQuestions.has(question.questionNumber);

    if (!hasUnderscore) {
      return (
        <span className="text-gray-800" style={{ whiteSpace: "pre-wrap" }}>
          {questionText}
        </span>
      );
    }

    // Split by underscores and create inline inputs
    const parts = questionText.split(/_{2,}/g);

    return (
      <span className="inline group" style={{ whiteSpace: "pre-wrap" }}>
        {parts.map((part: any, idx: any) => (
          <React.Fragment key={idx}>
            {part && (
              <span
                className="text-gray-800 inline"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {processText(part)}
              </span>
            )}
            {idx < parts.length - 1 && (
              <span className="peer-span inline-flex items-center [&:hover>button]:w-5 [&:hover>button]:ml-1">
                <input
                  type="text"
                  placeholder={`${question.questionNumber}`}
                  value={answers[question.questionNumber] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.questionNumber, e.target.value)
                  }
                  className={`border rounded-md focus:border-gray-600 focus:ring-0 
    p-0 text-sm text-gray-800 
    font-medium transition-all ${
      isFlagged
        ? "border-yellow-400 bg-yellow-100"
        : "border-gray-400 bg-transparent"
    }`}
                  style={{
                    direction: "ltr",
                    textAlign: answers[question.questionNumber]
                      ? "left"
                      : "center",
                    width: answers[question.questionNumber]
                      ? `${answers[question.questionNumber].length}ch`
                      : "7rem",
                    minWidth: "7rem",
                    maxWidth: "20ch",
                    padding: 0,
                  }}
                />
                <button
                  onClick={() => toggleFlag(question.questionNumber)}
                  className={`transition-all overflow-hidden ${
                    isFlagged
                      ? "text-yellow-500 w-5 ml-1"
                      : "text-gray-300 hover:text-yellow-400 w-0"
                  }`}
                >
                  <Bookmark
                    size={20}
                    // height={200}
                    fill={isFlagged ? "currentColor" : "none"}
                  />
                </button>
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Text processing: bB bold qilish va 1rem margin
  const processText = (text: string) => {
    if (!text) return text;

    // Old format support: "1rem" at start
    const hasOldMargin = text.startsWith("1rem");
    if (hasOldMargin) {
      const cleanText = text.slice(4);
      const convertedText = cleanText.replace(/bB([^bB]*)bB/g, "**$1**");
      return (
        <span className="ml-4 inline-block">
          <TextFormatter text={convertedText} />
        </span>
      );
    }

    // New format: Use TextFormatter with multiline margin support (1r, 2r, 3r...)
    const convertedText = text.replace(/bB([^bB]*)bB/g, "**$1**");
    return <TextFormatter text={convertedText} />;
  };

  // Context text processing - 1rem va bB support + markdown
  const processContextText = (text: string) => {
    if (!text) return text;

    // Old format support: "1rem" at start
    const hasOldMargin = text.startsWith("1rem");
    if (hasOldMargin) {
      const cleanText = text.slice(4);
      const convertedText = cleanText.replace(/bB([^bB]*)bB/g, "**$1**");
      return (
        <span className="ml-4 inline-block">
          <TextFormatter text={convertedText} />
        </span>
      );
    }

    // New format: Use TextFormatter with multiline margin support (1r, 2r, 3r...)
    // TextFormatter handles: **bold**, *italic*, __underline__, 1r margin, 2r margin, etc.
    const convertedText = text.replace(/bB([^bB]*)bB/g, "**$1**");
    return <TextFormatter text={convertedText} />;
  };

  const currentPassage = test.passages[currentPart];
  if (!currentPassage) return null;

  const questionGroups = groupQuestionsByType(currentPassage.questions || []);
  const startNumber = currentPassage.questions?.[0]?.questionNumber ?? 1;
  const endNumber =
    currentPassage.questions?.[currentPassage.questions.length - 1]
      ?.questionNumber ?? currentPassage.questions.length;

  // Get all questions text for highlighting
  const allQuestionsText = currentPassage.questions
    .map((q: any) => `${q.questionNumber}. ${q.question}`)
    .join("\n");
  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-gray-50 to-slate-50">
      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-purple-100">
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
                  0,
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
                className="flex-1 px-6 py-4 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 font-semibold shadow-lg transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModal && activeKey !== null && activeIndex !== null && (
        <div className="note-modal fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Note</h3>
              <button
                onClick={() => {
                  setNoteModal(false);
                  setActiveKey(null);
                  setActiveIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  setActiveKey(null);
                  setActiveIndex(null);
                }}
                className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeKey && activeIndex !== null) {
                    const contextHighlights = [
                      ...(highlights[activeKey] || []),
                    ];
                    contextHighlights[activeIndex].note = noteText;
                    setHighlights((prev) => ({
                      ...prev,
                      [activeKey]: contextHighlights,
                    }));
                  }
                  setNoteModal(false);
                  setActiveKey(null);
                  setActiveIndex(null);
                }}
                className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold shadow transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setInfoModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              How to use Highlight & Notes
            </h2>

            <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
              <li>• Select any part of the passage text using your mouse.</li>
              <li>
                • Click <b>Highlight (colors)</b> to mark important information.
              </li>
              <li>
                • Add a <b>Note (+)</b> to save keywords or ideas.
              </li>
              <li>• Highlights help you locate answers faster.</li>
              <li>
                • Notes help you remember key points while answering questions.
              </li>
            </ul>

            <div className="mt-4 p-3 bg-purple-50 text-purple-700 text-xs rounded-lg">
              💡 Tip: Avoid highlighting too much. Focus on keywords, names, and
              dates.
            </div>
          </div>
        </div>
      )}

      {/* Header - Compact */}
      <header className="bg-[#9C74FF] shadow-lg shrink-0">
        <div className="max-w-full mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/reading")}
              className="flex items-center gap-1.5 text-white hover:text-purple-100 transition-colors bg-white/10 px-3 py-1.5 rounded-lg text-sm"
            >
              <ChevronLeft size={16} />
              <span className="font-medium">Exit</span>
            </button>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="bg-white text-[#9C74FF] px-3 py-1 rounded-md font-bold text-sm shadow-md">
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
              onClick={() => setShowNotesSidebar(!showNotesSidebar)}
              className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-lg ${
                showNotesSidebar
                  ? "bg-[#9C74FF] text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span title="View Notes">
                <NotebookPenIcon />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Part Info Banner - Compact */}
      <div className="bg-[#9C74FF] border-t border-white/20 shrink-0 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-2 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              READING PASSAGE {currentPart + 1}
            </h2>
            <p className="text-purple-100 text-xs italic">
              You should spend about 20 minutes on Questions {startNumber}-
              {endNumber}, which are based on Reading Passage {currentPart + 1}{" "}
              below.
            </p>
          </div>

          <button
            onClick={() => setInfoModal(true)}
            className="shrink-0 p-2 rounded-full hover:bg-white/20 transition"
          >
            <Info />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full flex p-6 gap-0">
          {/* Passage */}
          <div
            className=" bg-white rounded-l-2xl shadow-xl flex flex-col overflow-hidden border-2 border-r-0 border-purple-100"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="px-8 py-6 border-b-2 border-purple-100 shrink-0 bg-linear-to-r from-white to-purple-50">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentPassage.title}
              </h3>
            </div>
            <div
              className="flex-1 overflow-y-auto px-8 py-6"
              ref={passageContainerRef}
            >
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed passage-content">
                {currentPassage.hasParagraphs &&
                currentPassage.paragraphs &&
                currentPassage.paragraphs.length > 0
                  ? // With Paragraphs or With Input Paragraphs
                    currentPassage.paragraphs.map(
                      (para: string, idx: number) => {
                        const paragraphLabel = String.fromCharCode(65 + idx);

                        // Drag-drop question va question number topish
                        const dragDropQuestion = currentPassage.questions?.find(
                          (q: any) =>
                            q.questionType === "matching-headings-drag-drop",
                        );
                        const baseQuestionNum =
                          dragDropQuestion?.questionNumber || 0;
                        const questionNum = baseQuestionNum + idx;
                        const currentAnswer = answers[questionNum];

                        return (
                          <div key={idx} className="mb-8">
                            {/* Drop Zone - PARAGRAPH OLDIN */}
                            {currentPassage.hasInputParagraphs && (
                              <div className="mb-3 flex items-center gap-3">
                                <span className="font-bold text-lg text-gray-900 shrink-0 w-8">
                                  {paragraphLabel}
                                </span>
                                <div
                                  className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 min-h-[70px] transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-md"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add(
                                      "border-purple-600",
                                      "bg-purple-200",
                                      "shadow-lg",
                                    );
                                  }}
                                  onDragLeave={(e) => {
                                    e.currentTarget.classList.remove(
                                      "border-purple-600",
                                      "bg-purple-200",
                                      "shadow-lg",
                                    );
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove(
                                      "border-purple-600",
                                      "bg-purple-200",
                                      "shadow-lg",
                                    );
                                    const heading =
                                      e.dataTransfer.getData("text/plain");
                                    if (heading && dragDropQuestion) {
                                      handleAnswerChange(questionNum, heading);
                                    }
                                  }}
                                >
                                  {currentAnswer ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-purple-600 text-lg">
                                          {questionNum}.
                                        </span>
                                        <span className="text-gray-800 font-semibold">
                                          {currentAnswer}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleAnswerChange(questionNum, "")
                                        }
                                        className="text-red-500 hover:text-red-700 text-2xl font-bold transition-all hover:scale-110"
                                        title="Remove heading"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 text-purple-400">
                                      <span className="text-sm font-medium">
                                        Drop heading for Paragraph{" "}
                                        {paragraphLabel} here
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Paragraph Text */}
                            <div className="flex gap-3 items-start">
                              {!currentPassage.hasInputParagraphs && (
                                <span className="font-bold text-lg text-gray-900 shrink-0">
                                  {paragraphLabel}
                                </span>
                              )}
                              <div
                                className={`flex-1 ${currentPassage.hasInputParagraphs ? "ml-11" : ""}`}
                              >
                                {renderHighlighted(
                                  para,
                                  `passage-${currentPassage.passageNumber}-para-${idx}`,
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )
                  : // Normal passage
                    renderHighlighted(
                      currentPassage.content,
                      `passage-${currentPassage.passageNumber}`,
                    )}
              </div>
            </div>
          </div>

          {/* Resizer */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-3 bg-[#9C74FF] hover:bg-purple-600 cursor-col-resize flex items-center justify-center transition-all shadow-lg ${
              isDragging ? "bg-purple-600" : ""
            }`}
          >
            <GripVertical size={18} className="text-white drop-shadow-md" />
          </div>

          {/* Questions */}
          <div
            className="bg-white rounded-r-2xl shadow-xl flex flex-col overflow-hidden border-2 border-l-0 border-purple-100"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="px-8 py-6 border-b-2 border-purple-100 shrink-0 bg-linear-to-r from-purple-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900">Questions</h3>
            </div>

            <div
              className="flex-1 overflow-y-auto px-8 py-6 questions-content"
              ref={questionContainerRef}
            >
              <div>
                {questionGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {renderInstructions(
                      group.type,
                      group.start,
                      group.end,
                      group.questions,
                    )}

                    {/* Display options box for matching types BEFORE questions */}
                    {(group.type === "matching-sentence-endings" ||
                      group.type === "matching-headings" ||
                      group.type === "matching-headings-drag-drop" ||
                      group.type === "matching-features" ||
                      group.type === "summary-completion-with-text") &&
                      group.allOptions &&
                      group.allOptions.length > 0 && (
                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
                          {group.type === "matching-headings-drag-drop" ? (
                            // Draggable headings
                            <div>
                              {/* Instruction - backend'dan */}
                              {group.instruction && (
                                <p className="text-sm text-gray-700 mb-3 italic">
                                  {group.instruction}
                                </p>
                              )}
                              <div className="grid grid-cols-1 gap-2">
                                {group.allOptions.map(
                                  (option: string, idx: number) => {
                                    // Bu heading ishlatilganmi tekshirish
                                    const isUsed =
                                      Object.values(answers).includes(option);

                                    // Agar ishlatilgan bo'lsa - ko'rsatmaslik
                                    if (isUsed) {
                                      return (
                                        <div
                                          key={idx}
                                          className="flex gap-2 items-center bg-gray-200 border-2 border-gray-300 rounded-lg p-3 opacity-50"
                                        >
                                          <span className="font-bold text-gray-400 shrink-0">
                                            {toRoman(idx + 1)}
                                          </span>
                                          <span className="text-gray-500 font-medium line-through">
                                            {option}
                                          </span>
                                          <span className="ml-auto text-green-600 text-sm font-bold">
                                            ✓ Used
                                          </span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData(
                                            "text/plain",
                                            option,
                                          );
                                          e.currentTarget.style.opacity = "0.5";
                                        }}
                                        onDragEnd={(e) => {
                                          e.currentTarget.style.opacity = "1";
                                        }}
                                        className="flex gap-2 items-center bg-white border-2 border-purple-200 rounded-lg p-3 cursor-move hover:border-purple-400 hover:shadow-md transition-all"
                                      >
                                        <span className="font-bold text-purple-600 shrink-0">
                                          {toRoman(idx + 1)}
                                        </span>
                                        <span className="text-gray-800 font-medium">
                                          {option}
                                        </span>
                                        <span className="ml-auto text-gray-400 text-xs">
                                          ⋮⋮
                                        </span>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          ) : (
                            // Normal options box
                            <div className="grid grid-cols-1 gap-2">
                              {group.allOptions.map(
                                (option: string, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="font-bold text-gray-900 shrink-0">
                                      {group.type === "matching-headings"
                                        ? toRoman(idx + 1)
                                        : String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-gray-800">
                                      {option}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    {group.questions.map((question: any) => {
                      const questionText = question.question;
                      const hasUnderscore = /_{2,}/g.test(questionText);

                      return (
                        <React.Fragment key={question.questionNumber}>
                          {/* ✅ Context Text - har bir questiondan oldin */}
                          {question?.contextText && (
                            <pre className="text-gray-800 whitespace-pre-wrap font-sans text-base leading-relaxed m-0">
                              {processContextText(question.contextText)}
                            </pre>
                          )}

                          {/* Sentence completion or questions with underscores - inline input */}
                          {hasUnderscore ? (
                            <div
                              id={`question-${question.questionNumber}`}
                              className="leading-relaxed scroll-mt-6"
                            >
                              {renderQuestionText(question)}
                            </div>
                          ) : // Multiple choice with radio buttons
                          question.questionType === "multiple-choice" &&
                            question.options ? (
                            <div
                              id={`question-${question.questionNumber}`}
                              className={`mb-6 scroll-mt-6 ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 -m-4"
                                  : ""
                              }`}
                            >
                              <div className="flex items-baseline gap-2">
                                <button
                                  onClick={() =>
                                    toggleFlag(question.questionNumber)
                                  }
                                  className={`shrink-0 transition-all ${
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                  title={
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "Unflag question"
                                      : "Flag question"
                                  }
                                >
                                  <Flag
                                    size={18}
                                    fill={
                                      flaggedQuestions.has(
                                        question.questionNumber,
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <span className="font-bold text-gray-900 shrink-0">
                                  {question.questionNumber}.
                                </span>
                                <p className="text-gray-800 font-medium flex-1">
                                  {processText(questionText)}
                                </p>
                              </div>
                              <div className="space-y-2 pl-6 mt-3">
                                {question.options.map(
                                  (option: string, idx: number) => (
                                    <label
                                      key={idx}
                                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        answers[question.questionNumber] ===
                                        option
                                          ? "bg-purple-50 border-purple-400"
                                          : "border-gray-200 hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q-${question.questionNumber}`}
                                        value={option}
                                        checked={
                                          answers[question.questionNumber] ===
                                          option
                                        }
                                        onChange={(e) =>
                                          handleAnswerChange(
                                            question.questionNumber,
                                            e.target.value,
                                          )
                                        }
                                        className="text-[#9C74FF] focus:ring-[#9C74FF]"
                                      />
                                      <span className="text-gray-800">
                                        {option}
                                      </span>
                                    </label>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : // True/False/Not Given or Yes/No/Not Given - horizontal buttons
                          question.questionType === "true-false-not-given" ||
                            question.questionType === "yes-no-not-given" ? (
                            <div
                              id={`question-${question.questionNumber}`}
                              className={`mb-6 scroll-mt-6 ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 -m-4"
                                  : ""
                              }`}
                            >
                              <div className="flex items-baseline gap-2 mb-3">
                                <button
                                  onClick={() =>
                                    toggleFlag(question.questionNumber)
                                  }
                                  className={`shrink-0 transition-all ${
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                  title={
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "Unflag question"
                                      : "Flag question"
                                  }
                                >
                                  <Flag
                                    size={18}
                                    fill={
                                      flaggedQuestions.has(
                                        question.questionNumber,
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <span className="font-bold text-gray-900 shrink-0">
                                  {question.questionNumber}.
                                </span>
                                <p className="text-gray-800 font-medium flex-1">
                                  {processText(questionText)}
                                </p>
                              </div>

                              <div className="flex gap-3 pl-6">
                                {(question.questionType ===
                                "true-false-not-given"
                                  ? ["TRUE", "FALSE", "NOT GIVEN"]
                                  : ["YES", "NO", "NOT GIVEN"]
                                ).map((option) => (
                                  <label
                                    key={option}
                                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer transition-all ${
                                      answers[question.questionNumber] ===
                                      option
                                        ? "bg-purple-50 border-purple-400"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${question.questionNumber}`}
                                      value={option}
                                      checked={
                                        answers[question.questionNumber] ===
                                        option
                                      }
                                      onChange={(e) =>
                                        handleAnswerChange(
                                          question.questionNumber,
                                          e.target.value,
                                        )
                                      }
                                      className="text-[#9C74FF] focus:ring-[#9C74FF]"
                                    />
                                    <span className="text-sm font-medium">
                                      {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : // Matching headings drag-drop - NO INPUT (faqat passage'da drop zones)
                          question.questionType ===
                            "matching-headings-drag-drop" ? (
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm italic">
                                → Drag headings to paragraphs in the passage
                              </p>
                            </div>
                          ) : // Matching types with dropdown
                          (question.questionType === "matching" ||
                              question.questionType ===
                                "matching-sentence-endings" ||
                              question.questionType === "matching-headings" ||
                              question.questionType === "matching-features" ||
                              question.questionType ===
                                "matching-information" ||
                              question.questionType ===
                                "summary-completion-with-text") &&
                            question.options ? (
                            <div
                              id={`question-${question.questionNumber}`}
                              className={`mb-4 scroll-mt-6 ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 -m-4"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() =>
                                    toggleFlag(question.questionNumber)
                                  }
                                  className={`shrink-0 transition-all mt-2 ${
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                  title={
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "Unflag question"
                                      : "Flag question"
                                  }
                                >
                                  <Flag
                                    size={18}
                                    fill={
                                      flaggedQuestions.has(
                                        question.questionNumber,
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <span className="font-bold text-gray-900 shrink-0 mt-2">
                                  {question.questionNumber}.
                                </span>

                                <p className="text-gray-800 flex-1 mt-2">
                                  {processText(questionText)}
                                </p>

                                <select
                                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#9C74FF] bg-white min-w-[120px]"
                                  value={answers[question.questionNumber] || ""}
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question.questionNumber,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {question.options.map(
                                    (opt: string, idx: number) => {
                                      const isHeadings =
                                        question.questionType ===
                                        "matching-headings";
                                      const label = isHeadings
                                        ? toRoman(idx + 1)
                                        : String.fromCharCode(65 + idx);

                                      return (
                                        <option key={idx} value={opt}>
                                          {label}
                                        </option>
                                      );
                                    },
                                  )}
                                </select>
                              </div>
                            </div>
                          ) : // Summary completion with box
                          question.questionType === "summary-completion-box" &&
                            question.options ? (
                            <div
                              id={`question-${question.questionNumber}`}
                              className={`mb-4 scroll-mt-6 ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 -m-4"
                                  : ""
                              }`}
                            >
                              <div className="flex items-baseline gap-2">
                                <button
                                  onClick={() =>
                                    toggleFlag(question.questionNumber)
                                  }
                                  className={`shrink-0 transition-all ${
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                  title={
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "Unflag question"
                                      : "Flag question"
                                  }
                                >
                                  <Flag
                                    size={18}
                                    fill={
                                      flaggedQuestions.has(
                                        question.questionNumber,
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <div className="flex-1">
                                  <p className="text-gray-800 mb-2">
                                    {questionText}
                                  </p>

                                  <select
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#9C74FF] bg-white"
                                    value={
                                      answers[question.questionNumber] || ""
                                    }
                                    onChange={(e) =>
                                      handleAnswerChange(
                                        question.questionNumber,
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">Select from box</option>
                                    {question.options.map(
                                      (opt: string, idx: number) => (
                                        <option key={idx} value={opt}>
                                          {opt}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Default
                            <div
                              id={`question-${question.questionNumber}`}
                              className={`mb-4 scroll-mt-6 ${
                                flaggedQuestions.has(question.questionNumber)
                                  ? "bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 -m-4"
                                  : ""
                              }`}
                            >
                              <div className="flex items-baseline gap-2">
                                <button
                                  onClick={() =>
                                    toggleFlag(question.questionNumber)
                                  }
                                  className={`shrink-0 transition-all ${
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                  title={
                                    flaggedQuestions.has(
                                      question.questionNumber,
                                    )
                                      ? "Unflag question"
                                      : "Flag question"
                                  }
                                >
                                  <Flag
                                    size={18}
                                    fill={
                                      flaggedQuestions.has(
                                        question.questionNumber,
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <span className="font-bold text-gray-900 shrink-0">
                                  {question.questionNumber}.
                                </span>
                                <p className="text-gray-800 flex-1">
                                  {processText(questionText)}
                                </p>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Popup */}
      {sel && (
        <div
          className="highlight-menu fixed z-50 flex items-center gap-2 bg-white shadow-xl rounded-full p-2 border border-gray-200"
          style={{
            left: sel.clientX,
            top: sel.clientY,
            transform: "translateX(-50%)",
          }}
        >
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

          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                const contextKey =
                  sel.context === "passage"
                    ? `passage-${currentPassage.passageNumber}`
                    : `questions-${currentPassage.passageNumber}`;
                setHighlights((prev) => ({
                  ...prev,
                  [contextKey]: [
                    ...(prev[contextKey] || []),
                    { start: sel.start, end: sel.end, color: c.name },
                  ],
                }));
                setSel(null);
                window.getSelection()?.removeAllRanges();
              }}
              className={`w-8 h-8 rounded-full ${c.bg} ${c.hover} transition`}
              aria-label={c.name}
            />
          ))}

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={() => {
              const contextKey =
                sel.context === "passage"
                  ? `passage-${currentPassage.passageNumber}`
                  : `questions-${currentPassage.passageNumber}`;
              const currentHighlights = highlights[contextKey] || [];
              setHighlights((prev) => ({
                ...prev,
                [contextKey]: [
                  ...currentHighlights,
                  {
                    start: sel.start,
                    end: sel.end,
                    color: "yellow",
                    note: "",
                  },
                ],
              }));
              setActiveKey(contextKey);
              setActiveIndex(currentHighlights.length);
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

      {/* Notes Sidebar */}
      {showNotesSidebar && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l-2 border-purple-200 z-40 flex flex-col">
          <div className="bg-linear-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              📝 My Notes
            </h3>
            <button
              onClick={() => setShowNotesSidebar(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {Object.entries(highlights).map(([key, contextHighlights]) => {
              const notesInContext = contextHighlights.filter((h) => h.note);
              if (notesInContext.length === 0) return null;

              const isPassage = key.startsWith("passage-");
              const passageNum = key.split("-")[1];

              return (
                <div key={key} className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b-2 border-purple-200">
                    {isPassage
                      ? `Passage ${passageNum}`
                      : `Questions - Passage ${passageNum}`}
                  </h4>
                  <div className="space-y-3">
                    {notesInContext.map((highlight, idx) => {
                      const passage = test.passages.find(
                        (p: any) => p.passageNumber === parseInt(passageNum),
                      );

                      let highlightedText = "";
                      if (isPassage && passage) {
                        highlightedText = passage.content.slice(
                          highlight.start,
                          highlight.end,
                        );
                      } else {
                        highlightedText = allQuestionsText.slice(
                          highlight.start,
                          highlight.end,
                        );
                      }

                      const color = HIGHLIGHT_COLORS.find(
                        (c) => c.name === highlight.color,
                      );

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${
                            color?.border || "border-gray-200"
                          } ${color?.bg || "bg-gray-50"}`}
                        >
                          <div className="text-sm text-gray-600 mb-2 font-medium line-clamp-2">
                            "{highlightedText}"
                          </div>
                          <div className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200">
                            {highlight.note}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {Object.values(highlights).every(
              (h) => h.filter((item) => item.note).length === 0,
            ) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 font-medium">No notes yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Select text and click + to add notes
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer - Enhanced with Question Numbers */}
      <div className="bg-white border-t-2 border-gray-200 shrink-0 shadow-lg">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Part Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToPreviousPart}
                disabled={currentPart === 0}
                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous Part"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {test.passages.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() =>
                      router.push(`/reading/${testId}?part=${idx}`)
                    }
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      idx === currentPart
                        ? "bg-[#9C74FF] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    Part {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Question Numbers */}
            <div className="flex-1 flex justify-center">
              <div className="flex gap-1 flex-wrap max-w-3xl">
                {currentPassage.questions.map((question: any) => {
                  const isAnswered = answers[question.questionNumber];
                  const isFlagged = flaggedQuestions.has(
                    question.questionNumber,
                  );

                  return (
                    <button
                      key={question.questionNumber}
                      onClick={() => {
                        const questionElement = document.getElementById(
                          `question-${question.questionNumber}`,
                        );
                        if (questionElement) {
                          questionElement.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "nearest",
                          });
                          // Add extra offset after scroll
                          setTimeout(() => {
                            if (questionContainerRef.current) {
                              questionContainerRef.current.scrollTop -= 100;
                            }
                          }, 100);
                        }
                      }}
                      className={`relative min-w-10 h-10 px-3 rounded-md font-semibold text-sm transition-all border ${
                        isFlagged
                          ? "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200"
                          : isAnswered
                            ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                      title={`Question ${question.questionNumber}${isFlagged ? " (Flagged)" : ""}${isAnswered ? " (Answered)" : ""}`}
                    >
                      {question.questionNumber}
                      {isFlagged && (
                        <Flag
                          size={10}
                          className="absolute -top-1 -right-1 text-yellow-600"
                          fill="currentColor"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Part Info and Next */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-gray-600">
                {currentPassage.questions[0]?.questionNumber || 0}/
                {test.passages.reduce(
                  (sum: number, p: any) => sum + p.questions.length,
                  0,
                )}
              </div>

              <button
                onClick={goToNextPart}
                disabled={currentPart === test.passages.length - 1}
                className="px-6 py-2 bg-[#9C74FF] text-white rounded-lg hover:bg-[#8a62e0] disabled:opacity-30 disabled:cursor-not-allowed font-semibold shadow-md transition-all flex items-center gap-2"
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {currentPart === test.passages.length - 1 && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
