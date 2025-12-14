"use client";
import React, { FC, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

const API_BASE = "/api";

type QuestionType =
  | "multiple-choice"
  | "form-completion"
  | "note-completion"
  | "matching"
  | "short-answer"
  | "plan-map-diagram"
  | "table-completion"
  | "flow-chart"
  | "summary-completion"
  | "sentence-completion";

interface Question {
  questionNumber: number;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  imageUrl?: string; // New field for plan/map/diagram images
}

interface Section {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  transcript: string;
  questions: Question[];
}

interface ListeningTest {
  testName: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  testType: "Academic" | "General";
  sections: Section[];
  totalQuestions: number;
}

interface AddListeningTestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "matching", label: "Matching" },
  { value: "plan-map-diagram", label: "Plan/Map/Diagram Labelling" },
  { value: "form-completion", label: "Form Completion" },
  { value: "note-completion", label: "Note Completion" },
  { value: "table-completion", label: "Table Completion" },
  { value: "flow-chart", label: "Flow-chart Completion" },
  { value: "summary-completion", label: "Summary Completion" },
  { value: "sentence-completion", label: "Sentence Completion" },
  { value: "short-answer", label: "Short Answer Questions" },
];

export const AddListeningTestModal: FC<AddListeningTestModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ListeningTest>({
    testName: "",
    difficulty: "medium",
    timeLimit: 30,
    testType: "Academic",
    sections: [],
    totalQuestions: 0,
  });

  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingAudio, setUploadingAudio] = useState<{
    [key: number]: boolean;
  }>({});
  const [uploadingImage, setUploadingImage] = useState<{
    [key: string]: boolean; // Changed to string key: "sectionIdx-questionIdx"
  }>({});
  const [testMode, setTestMode] = useState<boolean>(false);

  // Initialize with 4 empty sections on mount
  React.useEffect(() => {
    if (formData.sections.length === 0) {
      setFormData({
        ...formData,
        sections: [
          {
            sectionNumber: 1,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 2,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 3,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 4,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
        ],
      });
    }
  }, []);

  // ListeningModal.tsx - COMPLETE toggleTestMode function
  // Replace your existing toggleTestMode function with this

  const toggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);

    if (newTestMode) {
      setFormData({
        testName: "🧪 IELTS Listening Practice Test - Cambridge Style",
        difficulty: "medium",
        timeLimit: 30,
        testType: "Academic",
        totalQuestions: 40,
        sections: [
          // ========================================
          // SECTION 1: Social/Everyday Conversation (Questions 1-10)
          // ========================================
          {
            sectionNumber: 1,
            title: "Section 1 - Booking a Hotel Room",
            audioUrl:
              "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            transcript:
              "A conversation between a customer and a hotel receptionist about booking a room for a business trip...",
            questions: [
              {
                questionNumber: 1,
                questionType: "form-completion",
                question: "Customer's surname: ________",
                options: ["Word limit: ONE WORD ONLY"],
                correctAnswer: "Morrison",
                points: 1,
              },
              {
                questionNumber: 2,
                questionType: "form-completion",
                question: "Phone number: ________",
                options: ["Numbers only"],
                correctAnswer: "07700900123",
                points: 1,
              },
              {
                questionNumber: 3,
                questionType: "form-completion",
                question: "Email address: john.morrison@________.com",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "techco",
                points: 1,
              },
              {
                questionNumber: 4,
                questionType: "multiple-choice",
                question: "What type of room does the customer want?",
                options: [
                  "A. Single room",
                  "B. Double room",
                  "C. Twin room",
                  "D. Suite",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 5,
                questionType: "short-answer",
                question: "How many nights will the customer stay?",
                options: ["Write a NUMBER"],
                correctAnswer: "3",
                points: 1,
              },
              {
                questionNumber: 6,
                questionType: "form-completion",
                question: "Check-in date: ________ July",
                options: ["Write the DATE"],
                correctAnswer: "15th",
                points: 1,
              },
              {
                questionNumber: 7,
                questionType: "multiple-choice",
                question: "What special requirement does the customer have?",
                options: [
                  "A. Sea view",
                  "B. Ground floor",
                  "C. Non-smoking",
                  "D. Late check-in",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 8,
                questionType: "form-completion",
                question: "Total cost: £________",
                options: ["Write a NUMBER"],
                correctAnswer: "285",
                points: 1,
              },
              {
                questionNumber: 9,
                questionType: "multiple-choice",
                question: "What is included in the room price?",
                options: [
                  "A. Breakfast only",
                  "B. Breakfast and dinner",
                  "C. All meals",
                  "D. No meals",
                ],
                correctAnswer: "A",
                points: 1,
              },
              {
                questionNumber: 10,
                questionType: "form-completion",
                question: "Parking is available for: £________ per day",
                options: ["Write a NUMBER"],
                correctAnswer: "12",
                points: 1,
              },
            ],
          },

          // ========================================
          // SECTION 2: Social/Everyday Monologue (Questions 11-20)
          // ========================================
          {
            sectionNumber: 2,
            title: "Section 2 - Information about City Library",
            audioUrl:
              "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            transcript:
              "A librarian giving information about the new city library facilities and services...",
            questions: [
              {
                questionNumber: 11,
                questionType: "multiple-choice",
                question: "When did the new library open?",
                options: [
                  "A. Last January",
                  "B. Last March",
                  "C. Last June",
                  "D. Last September",
                ],
                correctAnswer: "C",
                points: 1,
              },
              {
                questionNumber: 12,
                questionType: "multiple-choice",
                question: "What is special about the children's section?",
                options: [
                  "A. It has a separate entrance",
                  "B. It has storytelling sessions",
                  "C. It is the largest section",
                  "D. It has computers for kids",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 13,
                questionType: "plan-map-diagram",
                question: "Label the CAFE on the library floor plan",
                options: ["Location: Ground floor"],
                correctAnswer: "North entrance",
                points: 1,
                imageUrl:
                  "https://via.placeholder.com/800x500?text=Library+Floor+Plan+-+Ground+Floor",
              },
              {
                questionNumber: 14,
                questionType: "plan-map-diagram",
                question: "Label the STUDY ROOMS on the library floor plan",
                options: ["Location: Second floor"],
                correctAnswer: "East wing",
                points: 1,
                imageUrl:
                  "https://via.placeholder.com/800x500?text=Library+Floor+Plan+-+Second+Floor",
              },
              {
                questionNumber: 15,
                questionType: "matching",
                question: "What is located on the FIRST floor?",
                options: [
                  "Reference books",
                  "Children's section",
                  "Meeting rooms",
                  "Computer area",
                  "Fiction books",
                ],
                correctAnswer: "Reference books",
                points: 1,
              },
              {
                questionNumber: 16,
                questionType: "matching",
                question: "What is located on the SECOND floor?",
                options: [
                  "Reference books",
                  "Children's section",
                  "Meeting rooms",
                  "Computer area",
                  "Fiction books",
                ],
                correctAnswer: "Meeting rooms",
                points: 1,
              },
              {
                questionNumber: 17,
                questionType: "short-answer",
                question: "How many books can members borrow at one time?",
                options: ["Write NO MORE THAN TWO WORDS OR A NUMBER"],
                correctAnswer: "10",
                points: 1,
              },
              {
                questionNumber: 18,
                questionType: "short-answer",
                question: "How long can books be kept?",
                options: ["Write NO MORE THAN TWO WORDS"],
                correctAnswer: "three weeks",
                points: 1,
              },
              {
                questionNumber: 19,
                questionType: "multiple-choice",
                question: "What is the late return fee?",
                options: [
                  "A. 50p per day",
                  "B. £1 per day",
                  "C. £1.50 per day",
                  "D. £2 per day",
                ],
                correctAnswer: "A",
                points: 1,
              },
              {
                questionNumber: 20,
                questionType: "multiple-choice",
                question: "When is the library closed?",
                options: [
                  "A. Mondays",
                  "B. Sundays",
                  "C. Public holidays",
                  "D. Never",
                ],
                correctAnswer: "C",
                points: 1,
              },
            ],
          },

          // ========================================
          // SECTION 3: Academic Conversation (Questions 21-30)
          // ========================================
          {
            sectionNumber: 3,
            title: "Section 3 - Discussion about University Research Project",
            audioUrl:
              "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            transcript:
              "Two students discussing their environmental science research project with their tutor...",
            questions: [
              {
                questionNumber: 21,
                questionType: "multiple-choice",
                question: "What is the main topic of the research project?",
                options: [
                  "A. Air pollution in cities",
                  "B. Water conservation methods",
                  "C. Renewable energy sources",
                  "D. Plastic waste reduction",
                ],
                correctAnswer: "D",
                points: 1,
              },
              {
                questionNumber: 22,
                questionType: "multiple-choice",
                question: "Why did the students choose this topic?",
                options: [
                  "A. It was suggested by the tutor",
                  "B. They saw a documentary about it",
                  "C. It relates to their hometown",
                  "D. It was trending on social media",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 23,
                questionType: "matching",
                question: "What method will they use for DATA COLLECTION?",
                options: [
                  "Interviews",
                  "Surveys",
                  "Laboratory experiments",
                  "Field observations",
                  "Online research",
                ],
                correctAnswer: "Surveys",
                points: 1,
              },
              {
                questionNumber: 24,
                questionType: "matching",
                question: "What method will they use for DATA ANALYSIS?",
                options: [
                  "Interviews",
                  "Statistical software",
                  "Laboratory experiments",
                  "Field observations",
                  "Manual calculation",
                ],
                correctAnswer: "Statistical software",
                points: 1,
              },
              {
                questionNumber: 25,
                questionType: "note-completion",
                question: "Sample size: ________ participants",
                options: ["Write a NUMBER"],
                correctAnswer: "200",
                points: 1,
              },
              {
                questionNumber: 26,
                questionType: "note-completion",
                question: "Project duration: ________ months",
                options: ["Write a NUMBER"],
                correctAnswer: "6",
                points: 1,
              },
              {
                questionNumber: 27,
                questionType: "table-completion",
                question: "Week 1-2: Literature ________",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "review",
                points: 1,
              },
              {
                questionNumber: 28,
                questionType: "table-completion",
                question: "Week 3-8: Data ________",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "collection",
                points: 1,
              },
              {
                questionNumber: 29,
                questionType: "multiple-choice",
                question: "What problem do they anticipate?",
                options: [
                  "A. Limited budget",
                  "B. Low response rate",
                  "C. Equipment failure",
                  "D. Time constraints",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 30,
                questionType: "multiple-choice",
                question: "What does the tutor suggest they do?",
                options: [
                  "A. Change the topic",
                  "B. Reduce sample size",
                  "C. Offer incentives to participants",
                  "D. Extend the deadline",
                ],
                correctAnswer: "C",
                points: 1,
              },
            ],
          },

          // ========================================
          // SECTION 4: Academic Lecture (Questions 31-40)
          // ========================================
          {
            sectionNumber: 4,
            title: "Section 4 - Lecture on Ancient Egyptian Architecture",
            audioUrl:
              "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            transcript:
              "A university lecture about the construction techniques and significance of ancient Egyptian pyramids...",
            questions: [
              {
                questionNumber: 31,
                questionType: "sentence-completion",
                question:
                  "The Great Pyramid was built during the reign of Pharaoh ________.",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "Khufu",
                points: 1,
              },
              {
                questionNumber: 32,
                questionType: "sentence-completion",
                question: "The pyramid was originally ________ meters tall.",
                options: ["Write a NUMBER"],
                correctAnswer: "146",
                points: 1,
              },
              {
                questionNumber: 33,
                questionType: "sentence-completion",
                question:
                  "It took approximately ________ years to complete the construction.",
                options: ["Write a NUMBER"],
                correctAnswer: "20",
                points: 1,
              },
              {
                questionNumber: 34,
                questionType: "summary-completion",
                question:
                  "The pyramids were built as ________ for the pharaohs.",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "tombs",
                points: 1,
              },
              {
                questionNumber: 35,
                questionType: "summary-completion",
                question:
                  "Workers used ________ to transport heavy stone blocks.",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "ramps",
                points: 1,
              },
              {
                questionNumber: 36,
                questionType: "flow-chart",
                question: "First step: Quarry ________ blocks",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "limestone",
                points: 1,
              },
              {
                questionNumber: 37,
                questionType: "flow-chart",
                question: "Second step: ________ blocks to site",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "transport",
                points: 1,
              },
              {
                questionNumber: 38,
                questionType: "flow-chart",
                question: "Third step: ________ blocks into position",
                options: ["Write ONE WORD ONLY"],
                correctAnswer: "lift",
                points: 1,
              },
              {
                questionNumber: 39,
                questionType: "multiple-choice",
                question: "What is remarkable about the pyramid's alignment?",
                options: [
                  "A. It faces the rising sun",
                  "B. It points to true north",
                  "C. It aligns with the moon",
                  "D. It follows the Nile",
                ],
                correctAnswer: "B",
                points: 1,
              },
              {
                questionNumber: 40,
                questionType: "multiple-choice",
                question:
                  "According to recent research, what was the main workforce?",
                options: [
                  "A. Slaves",
                  "B. Prisoners",
                  "C. Skilled paid workers",
                  "D. Foreign laborers",
                ],
                correctAnswer: "C",
                points: 1,
              },
            ],
          },
        ],
      });
    } else {
      // OFF mode - reset to empty
      setFormData({
        testName: "",
        difficulty: "medium",
        timeLimit: 30,
        testType: "Academic",
        sections: [
          {
            sectionNumber: 1,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 2,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 3,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
          {
            sectionNumber: 4,
            title: "",
            audioUrl: "",
            transcript: "",
            questions: [],
          },
        ],
        totalQuestions: 0,
      });
    }
  };

  const handleAudioUpload = async (
    file: File,
    sectionIndex: number
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingAudio({ ...uploadingAudio, [sectionIndex]: true });
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error("Audio upload error:", error);
      throw error;
    } finally {
      setUploadingAudio({ ...uploadingAudio, [sectionIndex]: false });
    }
  };

  // NEW: Image upload handler
  const handleImageUpload = async (
    file: File,
    sectionIdx: number,
    questionIdx: number
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const key = `${sectionIdx}-${questionIdx}`;
    try {
      setUploadingImage({ ...uploadingImage, [key]: true });
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setUploadingImage({ ...uploadingImage, [key]: false });
    }
  };

  const addQuestion = (sectionIndex: number) => {
    const section = formData.sections[sectionIndex];
    const lastQuestionNumber =
      section.questions.length > 0
        ? section.questions[section.questions.length - 1].questionNumber
        : sectionIndex * 10;

    const newQuestion: Question = {
      questionNumber: lastQuestionNumber + 1,
      questionType: "multiple-choice",
      question: "",
      options: ["A", "B", "C", "D"],
      correctAnswer: "",
      points: 1,
    };

    const newSections = [...formData.sections];
    newSections[sectionIndex].questions.push(newQuestion);
    setFormData({ ...formData, sections: newSections });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      [field]: value,
    };
    setFormData({ ...formData, sections: newSections });
  };

  const updateSection = (
    sectionIndex: number,
    field: keyof Section,
    value: any
  ) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      [field]: value,
    };
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = async () => {
    const totalQuestionsCount = formData.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );

    if (!formData.testName.trim()) {
      alert("Please enter a test name");
      return;
    }

    if (totalQuestionsCount === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/listening`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalQuestions: totalQuestionsCount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Test created successfully!");
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || "Failed to create test");
      }
    } catch (error: any) {
      console.error("Error creating test:", error);
      alert(error.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const totalQuestionsCount = formData.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Listening Test
            </h2>
            <button
              onClick={toggleTestMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                testMode
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {testMode ? "🧪 Test Mode ON" : "Test Mode"}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                value={formData.testName}
                onChange={(e) =>
                  setFormData({ ...formData, testName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., IELTS Listening Practice Test 1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  value={formData.testType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      testType: e.target.value as "Academic" | "General",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Academic">Academic</option>
                  <option value="General">General Training</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Sections
              <span className="text-sm font-normal text-gray-500">
                (IELTS has 4 sections)
              </span>
            </h3>

            {formData.sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              >
                {/* Section Header */}
                <button
                  onClick={() =>
                    setExpandedSection(expandedSection === sIdx ? null : sIdx)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">
                      Section {sIdx + 1}
                    </span>
                    {section.title && (
                      <span className="text-sm text-gray-600">
                        - {section.title}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {section.questions.length} questions
                    </span>
                  </div>
                  {expandedSection === sIdx ? (
                    <ChevronUp className="text-gray-600" />
                  ) : (
                    <ChevronDown className="text-gray-600" />
                  )}
                </button>

                {/* Section Content */}
                {expandedSection === sIdx && (
                  <div className="p-6 bg-white space-y-6">
                    {/* Section Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(sIdx, "title", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          placeholder="e.g., A conversation about accommodation"
                        />
                      </div>

                      {/* Audio Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Audio File *
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={section.audioUrl}
                            onChange={(e) =>
                              updateSection(sIdx, "audioUrl", e.target.value)
                            }
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                            placeholder="Paste audio URL or upload file"
                          />
                          <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                            {uploadingAudio[sIdx] ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={20} />
                                Upload
                              </>
                            )}
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await handleAudioUpload(
                                      file,
                                      sIdx
                                    );
                                    updateSection(sIdx, "audioUrl", url);
                                  } catch (error) {
                                    alert("Failed to upload audio");
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Transcript
                        </label>
                        <textarea
                          value={section.transcript}
                          onChange={(e) =>
                            updateSection(sIdx, "transcript", e.target.value)
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          placeholder="Optional: Add the audio transcript"
                        />
                      </div>
                    </div>

                    {/* Questions */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900">Questions</h4>
                        <button
                          onClick={() => addQuestion(sIdx)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {section.questions.map((question, qIdx) => (
                          <div
                            key={qIdx}
                            className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <span className="font-bold text-gray-900">
                                Question {question.questionNumber}
                              </span>
                              <button
                                onClick={() => removeQuestion(sIdx, qIdx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Question Type *
                                </label>
                                <select
                                  value={question.questionType}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIdx,
                                      qIdx,
                                      "questionType",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                  {QUESTION_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Question Text *
                                </label>
                                <textarea
                                  value={question.question}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIdx,
                                      qIdx,
                                      "question",
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="Enter the question"
                                />
                              </div>

                              {/* Multiple Choice Options */}
                              {question.questionType === "multiple-choice" && (
                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    Options (A, B, C, D)
                                  </label>
                                  <div className="space-y-2">
                                    {["A", "B", "C", "D"].map((letter, idx) => (
                                      <input
                                        key={idx}
                                        type="text"
                                        value={question.options?.[idx] || ""}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...(question.options || []),
                                          ];
                                          newOptions[idx] = e.target.value;
                                          updateQuestion(
                                            sIdx,
                                            qIdx,
                                            "options",
                                            newOptions
                                          );
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder={`Option ${letter}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Matching Options */}
                              {question.questionType === "matching" && (
                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    Matching Options (comma-separated)
                                  </label>
                                  <input
                                    type="text"
                                    value={question.options?.join(", ") || ""}
                                    onChange={(e) => {
                                      const opts = e.target.value
                                        .split(",")
                                        .map((o) => o.trim());
                                      updateQuestion(
                                        sIdx,
                                        qIdx,
                                        "options",
                                        opts
                                      );
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="e.g., Library, Cafeteria, Gym, Pool"
                                  />
                                </div>
                              )}

                              {/* Plan/Map/Diagram - IMAGE UPLOAD */}
                              {question.questionType === "plan-map-diagram" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center gap-2 text-blue-800 font-semibold">
                                    <ImageIcon size={18} />
                                    <span>Map/Diagram Image</span>
                                  </div>

                                  {question.imageUrl ? (
                                    <div className="space-y-2">
                                      <img
                                        src={question.imageUrl}
                                        alt="Map/Diagram preview"
                                        className="w-full max-w-md rounded-lg border-2 border-blue-300 shadow-sm"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "https://via.placeholder.com/600x400?text=Image+Not+Found";
                                        }}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuestion(
                                              sIdx,
                                              qIdx,
                                              "imageUrl",
                                              ""
                                            )
                                          }
                                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold"
                                        >
                                          Remove Image
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <p className="text-sm text-blue-700">
                                        📸 Upload a map, floor plan, or diagram
                                        image
                                      </p>

                                      {/* Upload Button */}
                                      <label className="block">
                                        <div
                                          className={`px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                            uploadingImage[`${sIdx}-${qIdx}`]
                                              ? "border-blue-400 bg-blue-100"
                                              : "border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50"
                                          }`}
                                        >
                                          {uploadingImage[`${sIdx}-${qIdx}`] ? (
                                            <div className="flex items-center justify-center gap-3">
                                              <Loader2
                                                className="animate-spin text-blue-600"
                                                size={24}
                                              />
                                              <span className="text-blue-700 font-semibold">
                                                Uploading to Cloudinary...
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center gap-2">
                                              <Upload
                                                className="text-blue-600"
                                                size={32}
                                              />
                                              <div className="text-center">
                                                <p className="text-blue-700 font-semibold">
                                                  Click to upload image
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                  JPG, PNG, WebP (Max 5MB)
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={
                                            uploadingImage[`${sIdx}-${qIdx}`]
                                          }
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              // Check file size (5MB limit)
                                              if (file.size > 5 * 1024 * 1024) {
                                                alert(
                                                  "File size must be less than 5MB"
                                                );
                                                return;
                                              }

                                              try {
                                                const url =
                                                  await handleImageUpload(
                                                    file,
                                                    sIdx,
                                                    qIdx
                                                  );
                                                updateQuestion(
                                                  sIdx,
                                                  qIdx,
                                                  "imageUrl",
                                                  url
                                                );
                                              } catch (error: any) {
                                                alert(
                                                  `Upload failed: ${
                                                    error.message ||
                                                    "Unknown error"
                                                  }`
                                                );
                                              }
                                            }
                                            // Reset input
                                            e.target.value = "";
                                          }}
                                        />
                                      </label>

                                      {/* Divider */}
                                      <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                          <div className="w-full border-t border-blue-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                          <span className="px-2 bg-blue-50 text-blue-600">
                                            OR
                                          </span>
                                        </div>
                                      </div>

                                      {/* URL Input */}
                                      <div>
                                        <input
                                          type="text"
                                          value={question.imageUrl || ""}
                                          onChange={(e) =>
                                            updateQuestion(
                                              sIdx,
                                              qIdx,
                                              "imageUrl",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="Or paste image URL here"
                                        />
                                      </div>

                                      {/* Tips */}
                                      <div className="bg-blue-100 rounded-lg p-3 text-xs text-blue-800">
                                        <p className="font-semibold mb-1">
                                          💡 Tips:
                                        </p>
                                        <ul className="space-y-1 ml-4 list-disc">
                                          <li>
                                            Upload directly via button above
                                            (saved to Cloudinary)
                                          </li>
                                          <li>Or use any direct image URL</li>
                                          <li>
                                            Make sure the image is clear and
                                            labeled
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  <textarea
                                    value={question.options?.[0] || ""}
                                    onChange={(e) => {
                                      updateQuestion(sIdx, qIdx, "options", [
                                        e.target.value,
                                      ]);
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Optional: Add hint or location description"
                                  />
                                </div>
                              )}

                              {/* Form/Table/Note Completion */}
                              {(question.questionType === "form-completion" ||
                                question.questionType === "note-completion" ||
                                question.questionType ===
                                  "table-completion") && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                  <p className="text-sm text-purple-800 mb-2">
                                    📝 Completion questions - user will type the
                                    missing word(s)
                                  </p>
                                  <textarea
                                    value={question.options?.[0] || ""}
                                    onChange={(e) => {
                                      updateQuestion(sIdx, qIdx, "options", [
                                        e.target.value,
                                      ]);
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Optional: Add context or hint (e.g., 'Word limit: ONE WORD ONLY')"
                                  />
                                </div>
                              )}

                              {/* Flow-chart */}
                              {question.questionType === "flow-chart" && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <p className="text-sm text-green-800 mb-2">
                                    🔄 Flow-chart completion - describe the
                                    process step
                                  </p>
                                  <textarea
                                    value={question.options?.[0] || ""}
                                    onChange={(e) => {
                                      updateQuestion(sIdx, qIdx, "options", [
                                        e.target.value,
                                      ]);
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="e.g., 'Step in the manufacturing process'"
                                  />
                                </div>
                              )}

                              {/* Summary/Sentence Completion */}
                              {(question.questionType ===
                                "summary-completion" ||
                                question.questionType ===
                                  "sentence-completion") && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <p className="text-sm text-yellow-800 mb-2">
                                    ✍️ Completion question - user fills in the
                                    blank
                                  </p>
                                  <textarea
                                    value={question.options?.[0] || ""}
                                    onChange={(e) => {
                                      updateQuestion(sIdx, qIdx, "options", [
                                        e.target.value,
                                      ]);
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Optional: Word limit instruction"
                                  />
                                </div>
                              )}

                              {/* Short Answer */}
                              {question.questionType === "short-answer" && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <p className="text-sm text-gray-700 mb-2">
                                    💬 Short answer - user types their answer
                                  </p>
                                  <input
                                    type="text"
                                    value={question.options?.[0] || ""}
                                    onChange={(e) => {
                                      updateQuestion(sIdx, qIdx, "options", [
                                        e.target.value,
                                      ]);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Optional: Word limit"
                                  />
                                </div>
                              )}

                              {/* Correct Answer */}
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Correct Answer *
                                </label>
                                <input
                                  type="text"
                                  value={question.correctAnswer}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIdx,
                                      qIdx,
                                      "correctAnswer",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="Enter correct answer"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {section.questions.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <p>No questions added yet</p>
                            <p className="text-sm">
                              Click "Add Question" to start
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-between items-center rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span
              className={`font-semibold ${
                totalQuestionsCount >= 35 && totalQuestionsCount <= 45
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {totalQuestionsCount} questions
            </span>
            {" added"}
            {totalQuestionsCount < 35 && (
              <span className="text-orange-600">
                {" "}
                (recommended: 35-45 questions)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.testName.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                "Create Test"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
