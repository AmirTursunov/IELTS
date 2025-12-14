// types/index.ts

export type ActiveSection =
  | "dashboard"
  | "reading"
  | "listening"
  | "writing"
  | "speaking"
  | "users";

export interface Stats {
  totalReadingTests: number;
  totalListeningTests: number;
  totalTests: number;
}

// Reading Test Types
export interface Question {
  questionNumber: number;
  questionType:
    | "multiple-choice"
    | "true-false-not-given"
    | "matching"
    | "sentence-completion"
    | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface Passage {
  passageNumber: number;
  title: string;
  content: string;
  questions: Question[];
}

export interface ReadingTest {
  _id: string;
  title?: string;
  testName?: string;
  difficulty: "easy" | "medium" | "hard" | "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  passages: Passage[];
  totalQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

// Listening Test Types
export interface ListeningQuestion {
  questionNumber: number; // savol raqami
  questionType:
    | "multiple-choice" // variantli savol
    | "form-completion" // form to‘ldirish
    | "note-completion" // notalarni to‘ldirish
    | "matching" // moslashtirish
    | "short-answer" // qisqa javob
    | "table-completion" // jadvalni to‘ldirish
    | "flow-chart" // diagramma/flow-chart to‘ldirish
    | "summary-completion" // summary to‘ldirish
    | "plan-map-diagram" // xarita yoki diagramma belgilash
    | "sentence-completion"; // gap to‘ldirish
  question: string; // savol matni
  options?: string[]; // faqat kerak bo‘lganda variantlar
  correctAnswer: string; // to‘g‘ri javob har doim string
  points: number; // ball qiymati
}

export interface Section {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  transcript: string;
  questions: ListeningQuestion[];
}

export interface ListeningTest {
  _id: string;
  title?: string;
  testName?: string;
  difficulty: "easy" | "medium" | "hard" | "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  sections: Section[];
  totalQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Helper type to distinguish between test types
export type Test = ReadingTest | ListeningTest;

// Type guard functions
export function isReadingTest(test: Test): test is ReadingTest {
  return "passages" in test;
}

export function isListeningTest(test: Test): test is ListeningTest {
  return "sections" in test;
}
