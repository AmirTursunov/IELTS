"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Info, // <--- Icon
} from "lucide-react";

const API_BASE = "/api";

// --- YANGI: KENG TARQALGAN INSTRUKSIYALAR ---
const COMMON_INSTRUCTIONS = [
  "Write NO MORE THAN ONE WORD for each answer.",
  "Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer.",
  "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
  "Write NO MORE THAN THREE WORDS for each answer.",
  "Choose the correct letter, A, B, or C.",
  "Choose TWO letters, A-E.",
  "Label the map below. Write the correct letter, A-G, next to Questions.",
  "Complete the notes below.",
  "Complete the table below.",
  "Complete the flow-chart below.",
  "Answer the questions below.",
];

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
  questionNumber?: number;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  imageUrl?: string;
  contextText?: string; // contextText ham kerak
  instruction?: string; // <--- YANGI FIELD
}

interface QuestionGroup {
  id: string;
  type: QuestionType;
  count: number;
  sharedImageUrl?: string;
  instruction?: string; // <--- YANGI FIELD
  questions: Question[];
}

interface Section {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  transcript: string;
  questionGroups: QuestionGroup[];
  totalQuestions: number;
}

interface ListeningTest {
  _id?: string;
  testName: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  testType: "Academic" | "General";
  sections: Section[];
  totalQuestions: number;
}

interface EditListeningModalProps {
  test: ListeningTest;
  onClose: () => void;
  onSuccess: () => void;
}

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice", needsOptions: true },
  { value: "matching", label: "Matching", needsOptions: true },
  { value: "plan-map-diagram", label: "Plan/Map/Diagram", needsImage: true },
  { value: "form-completion", label: "Form Completion" },
  { value: "note-completion", label: "Note Completion" },
  { value: "table-completion", label: "Table Completion" },
  { value: "flow-chart", label: "Flow-chart" },
  { value: "summary-completion", label: "Summary" },
  { value: "sentence-completion", label: "Sentence Completion" },
  { value: "short-answer", label: "Short Answer" },
];

export function EditListeningModal({
  test,
  onClose,
  onSuccess,
}: EditListeningModalProps) {
  const [formData, setFormData] = useState<ListeningTest | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingAudio, setUploadingAudio] = useState<{
    [key: number]: boolean;
  }>({});
  const [uploadingImage, setUploadingImage] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchFullTestData = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`${API_BASE}/listening/${test._id}`);
        const result = await res.json();

        if (result.success) {
          const sectionsWithGroups = result.data.sections.map(
            (section: any) => {
              // Agar avvaldan groups bo'lsa (backend saqlagan bo'lsa), shuni ishlatamiz
              if (section.questionGroups?.length > 0) {
                return {
                  ...section,
                  totalQuestions: section.questions?.length || 0,
                };
              }

              // Agar flat list (questions array) bo'lsa, ularni qayta guruhlaymiz
              const groups: QuestionGroup[] = [];
              const questions: Question[] = section.questions || [];

              if (questions.length > 0) {
                let currentGroup: QuestionGroup | null = null;

                questions.forEach((q) => {
                  // MANTIQ: Agar type o'zgarsa YOKI instruction o'zgarsa -> yangi guruh
                  const isTypeChanged =
                    !currentGroup || currentGroup.type !== q.questionType;
                  const isInstructionChanged =
                    !currentGroup ||
                    (currentGroup.instruction || "") !== (q.instruction || "");

                  if (isTypeChanged || isInstructionChanged) {
                    if (currentGroup) groups.push(currentGroup);

                    currentGroup = {
                      id: `group-${Date.now()}-${Math.random()}`,
                      type: q.questionType,
                      count: 0,
                      instruction: q.instruction || "", // Instruksiyani olamiz
                      sharedImageUrl: q.imageUrl,
                      questions: [],
                    };
                  }

                  if (currentGroup) {
                    currentGroup.questions.push(q);
                    currentGroup.count++;
                  }
                });

                if (currentGroup) groups.push(currentGroup);
              }

              return {
                ...section,
                questionGroups: groups,
                totalQuestions: questions.length,
              };
            },
          );

          setFormData({
            ...result.data,
            sections: sectionsWithGroups,
          });
        } else {
          setFormData(test);
        }
      } catch (err) {
        console.error(err);
        setFormData(test);
      } finally {
        setLoadingData(false);
      }
    };

    fetchFullTestData();
  }, [test._id]);

  const calculateTotal = (sections: Section[]) =>
    sections.reduce((sum, s) => sum + s.totalQuestions, 0);

  const updateSection = (
    sectionIdx: number,
    field: keyof Section,
    value: any,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    // @ts-ignore
    sections[sectionIdx][field] = value;
    setFormData({ ...formData, sections });
  };

  const updateGroupField = (
    sectionIdx: number,
    groupIdx: number,
    field: keyof QuestionGroup,
    value: any,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    const group = sections[sectionIdx].questionGroups[groupIdx];

    if (field === "count") {
      const newCount = Number(value);
      if (newCount < 1 || newCount > 10) return;
      const diff = newCount - group.count;
      if (sections[sectionIdx].totalQuestions + diff > 10) {
        alert("Each section can have a maximum of 10 questions!");
        return;
      }

      let newQuestions = [...group.questions];
      if (newCount > group.count) {
        const needsOptions =
          group.type === "multiple-choice" || group.type === "matching";
        for (let i = group.count; i < newCount; i++) {
          newQuestions.push({
            question: "",
            correctAnswer: "",
            options: needsOptions ? ["", "", "", ""] : undefined,
            points: 1,
            questionType: group.type,
            instruction: group.instruction, // Yangi savolga guruh instruksiyasini beramiz
          });
        }
      } else {
        newQuestions = newQuestions.slice(0, newCount);
      }

      group.questions = newQuestions;
      group.count = newCount;
      sections[sectionIdx].totalQuestions += diff;
    } else {
      // @ts-ignore
      group[field] = value;
    }

    setFormData({
      ...formData,
      sections,
      totalQuestions: calculateTotal(sections),
    });
  };

  // --- YANGI: INSTRUCTION UPDATE ---
  const updateGroupInstruction = (
    sectionIdx: number,
    groupIdx: number,
    value: string,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    sections[sectionIdx].questionGroups[groupIdx].instruction = value;
    setFormData({ ...formData, sections });
  };

  const updateGroupType = (
    sectionIdx: number,
    groupIdx: number,
    newType: QuestionType,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    const group = sections[sectionIdx].questionGroups[groupIdx];

    const needsOptions =
      newType === "multiple-choice" || newType === "matching";

    group.type = newType;

    // Default instruction
    if (newType === "multiple-choice")
      group.instruction = "Choose the correct letter, A, B, or C.";
    else if (newType === "plan-map-diagram")
      group.instruction = "Label the plan below.";
    else group.instruction = "Write NO MORE THAN ONE WORD for each answer.";

    group.questions = group.questions.map((q) => ({
      ...q,
      options: needsOptions ? q.options || ["", "", "", ""] : undefined,
    }));

    setFormData({ ...formData, sections });
  };

  const updateQuestionField = (
    sectionIdx: number,
    groupIdx: number,
    qIdx: number,
    field: "question" | "correctAnswer" | "contextText",
    value: string,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    const q = sections[sectionIdx].questionGroups[groupIdx].questions[qIdx];
    q[field] = value;
    setFormData({ ...formData, sections });
  };

  const updateOption = (
    sectionIdx: number,
    groupIdx: number,
    qIdx: number,
    optIdx: number,
    value: string,
  ) => {
    if (!formData) return;
    const sections = [...formData.sections];
    const q = sections[sectionIdx].questionGroups[groupIdx].questions[qIdx];
    if (!q.options) q.options = ["", "", "", ""];
    q.options[optIdx] = value;
    setFormData({ ...formData, sections });
  };

  const addGroup = (sectionIdx: number) => {
    if (!formData) return;
    const section = formData.sections[sectionIdx];
    if (section.totalQuestions >= 10) {
      alert("Each section can have a maximum of 10 questions!");
      return;
    }

    const slots = 10 - section.totalQuestions;
    const defaultCount = Math.min(5, slots);

    const newGroup: QuestionGroup = {
      id: `group-${Date.now()}`,
      type: "short-answer",
      count: defaultCount,
      instruction:
        "Write NO MORE THAN ONE WORD and/or A NUMBER for each answer.",
      questions: Array(defaultCount)
        .fill(null)
        .map(() => ({
          question: "",
          correctAnswer: "",
          points: 1,
          questionType: "short-answer",
        })),
    };

    const sections = [...formData.sections];
    sections[sectionIdx].questionGroups.push(newGroup);
    sections[sectionIdx].totalQuestions += defaultCount;

    setFormData({
      ...formData,
      sections,
      totalQuestions: calculateTotal(sections),
    });
  };

  const deleteGroup = (sectionIdx: number, groupIdx: number) => {
    if (!formData || !confirm("Delete this question group?")) return;
    const sections = [...formData.sections];
    const count = sections[sectionIdx].questionGroups[groupIdx].count;
    sections[sectionIdx].questionGroups.splice(groupIdx, 1);
    sections[sectionIdx].totalQuestions -= count;

    setFormData({
      ...formData,
      sections,
      totalQuestions: calculateTotal(sections),
    });
  };

  const handleAudioUpload = async (
    sectionIdx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio((prev) => ({ ...prev, [sectionIdx]: true }));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (data.success && formData) {
        const sections = [...formData.sections];
        sections[sectionIdx].audioUrl = data.url;
        setFormData({ ...formData, sections });
      } else {
        alert("Upload failed");
      }
    } catch {
      alert("Server error");
    } finally {
      setUploadingAudio((prev) => ({ ...prev, [sectionIdx]: false }));
    }
  };

  const handleImageUpload = async (
    sectionIdx: number,
    groupIdx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${sectionIdx}-${groupIdx}`;
    setUploadingImage((prev) => ({ ...prev, [key]: true }));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (data.success && formData) {
        const sections = [...formData.sections];
        sections[sectionIdx].questionGroups[groupIdx].sharedImageUrl = data.url;
        setFormData({ ...formData, sections });
      } else {
        alert("Image upload failed");
      }
    } catch {
      alert("Server error");
    } finally {
      setUploadingImage((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;

    if (!formData.testName.trim()) return alert("Please enter test name!");

    for (let i = 0; i < formData.sections.length; i++) {
      const sec = formData.sections[i];
      if (sec.totalQuestions !== 10) {
        return alert(
          `Section ${i + 1} must have exactly 10 questions! (Current: ${
            sec.totalQuestions
          })`,
        );
      }
      if (!sec.audioUrl)
        return alert(`Section ${i + 1} requires an audio file!`);
    }

    const sectionsToSend = formData.sections.map((section) => {
      let qNum = (section.sectionNumber - 1) * 10 + 1;
      const allQs: Question[] = [];

      section.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          allQs.push({
            ...q,
            questionNumber: qNum++,
            questionType: group.type,
            imageUrl: group.sharedImageUrl || q.imageUrl,
            // --- MUHIM: Guruh instruksiyasini savolga yozamiz ---
            instruction: group.instruction || "",
          });
        });
      });

      return {
        sectionNumber: section.sectionNumber,
        title: section.title || `Section ${section.sectionNumber}`,
        audioUrl: section.audioUrl,
        transcript: section.transcript || "",
        questions: allQs,
      };
    });

    const payload = {
      testName: formData.testName,
      difficulty: formData.difficulty,
      timeLimit: formData.timeLimit,
      testType: formData.testType,
      sections: sectionsToSend,
      totalQuestions: 40,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/listening/${test._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        alert("Test updated successfully!");
        onSuccess();
        onClose();
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || !formData) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white p-10 rounded-2xl shadow-2xl">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  const totalQs = calculateTotal(formData.sections);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-purple-600 to-purple-700 px-8 py-6 flex items-center justify-between z-10 text-white">
          <div>
            <h2 className="text-3xl font-bold">
              Edit Test: {formData.testName}
            </h2>
            <p className="text-purple-100 mt-1">{totalQs} / 40 questions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Test Name
              </label>
              <input
                value={formData.testName}
                onChange={(e) =>
                  setFormData({ ...formData, testName: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as any,
                  })
                }
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Time (minutes)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeLimit: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="mb-10 p-6 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold">Overall Progress</span>
              <span className="text-2xl font-black text-purple-700">
                {totalQs} / 40
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${(totalQs / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Sections */}
          {formData.sections.map((section, idx) => (
            <div
              key={idx}
              className={`mb-6 border-2 rounded-xl overflow-hidden ${
                section.totalQuestions === 10
                  ? "border-green-400 bg-green-50"
                  : section.totalQuestions > 0
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300"
              }`}
            >
              {/* Section Header */}
              <div
                className="p-5 cursor-pointer flex justify-between items-center"
                onClick={() =>
                  setExpandedSection(expandedSection === idx ? null : idx)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                      section.totalQuestions === 10
                        ? "bg-green-600"
                        : section.totalQuestions > 0
                          ? "bg-yellow-600"
                          : "bg-gray-500"
                    }`}
                  >
                    {section.sectionNumber}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Part {section.sectionNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {section.totalQuestions} / 10 questions{" "}
                      {section.totalQuestions === 10 && "✓"}
                    </p>
                  </div>
                </div>
                {expandedSection === idx ? <ChevronUp /> : <ChevronDown />}
              </div>

              {expandedSection === idx && (
                <div className="p-6 bg-white space-y-8">
                  {/* Title + Audio + Transcript */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Section Title (optional)
                      </label>
                      <input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(idx, "title", e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-xl"
                        placeholder="e.g., Conversation about travel"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Audio File *
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        id={`audio-${idx}`}
                        className="hidden"
                        onChange={(e) => handleAudioUpload(idx, e)}
                      />
                      <label
                        htmlFor={`audio-${idx}`}
                        className={`block px-6 py-3 text-center rounded-xl font-medium cursor-pointer transition ${
                          uploadingAudio[idx]
                            ? "bg-gray-200"
                            : section.audioUrl
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        }`}
                      >
                        {uploadingAudio[idx] ? (
                          <>
                            Uploading...{" "}
                            <Loader2 className="inline animate-spin" />
                          </>
                        ) : section.audioUrl ? (
                          <>Audio Uploaded ✓</>
                        ) : (
                          <>Upload Audio *</>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Transcript (Optional)
                    </label>
                    <textarea
                      value={section.transcript || ""}
                      onChange={(e) =>
                        updateSection(idx, "transcript", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-xl h-28"
                      placeholder="Enter audio transcript..."
                    />
                  </div>

                  {/* Question Groups */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold">
                        Question Groups ({section.totalQuestions}/10)
                      </h4>
                      <button
                        onClick={() => addGroup(idx)}
                        disabled={section.totalQuestions >= 10}
                        className="px-5 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus size={18} /> Add Group
                      </button>
                    </div>

                    <div className="space-y-4">
                      {section.questionGroups.map((group, gIdx) => (
                        <div
                          key={group.id}
                          className="border rounded-xl overflow-hidden"
                        >
                          {/* Group Header */}
                          <div
                            className="px-5 py-3 bg-gray-100 flex justify-between items-center cursor-pointer"
                            onClick={() =>
                              setExpandedGroup(
                                expandedGroup === group.id ? null : group.id,
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {group.count}Q
                              </span>
                              <span className="font-semibold">
                                {
                                  QUESTION_TYPES.find(
                                    (t) => t.value === group.type,
                                  )?.label
                                }
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteGroup(idx, gIdx);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={18} />
                              </button>
                              {expandedGroup === group.id ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </div>
                          </div>

                          {expandedGroup === group.id && (
                            <div className="p-5 space-y-6 bg-white">
                              {/* Type + Count */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm mb-1">
                                    Type
                                  </label>
                                  <select
                                    value={group.type}
                                    onChange={(e) =>
                                      updateGroupType(
                                        idx,
                                        gIdx,
                                        e.target.value as QuestionType,
                                      )
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                  >
                                    {QUESTION_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">
                                    Number of Questions
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={group.count}
                                    onChange={(e) =>
                                      updateGroupField(
                                        idx,
                                        gIdx,
                                        "count",
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                  />
                                </div>
                              </div>

                              {/* --- YANGI: INSTRUCTION EDIT --- */}
                              <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                                  <Info size={12} className="text-purple-500" />
                                  Instruction (header)
                                </label>
                                <div className="relative">
                                  <select
                                    value={group.instruction || ""}
                                    onChange={(e) =>
                                      updateGroupInstruction(
                                        idx,
                                        gIdx,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border-2 border-purple-200 bg-purple-50/50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 appearance-none"
                                  >
                                    <option value="">
                                      -- No Instruction --
                                    </option>
                                    {COMMON_INSTRUCTIONS.map((inst, i) => (
                                      <option key={i} value={inst}>
                                        {inst}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                                {/* Custom Instruction */}
                                <input
                                  type="text"
                                  placeholder="Or type custom instruction..."
                                  className="w-full mt-2 px-3 py-2 border-b-2 border-gray-200 text-xs focus:outline-none focus:border-purple-400"
                                  value={group.instruction || ""}
                                  onChange={(e) =>
                                    updateGroupInstruction(
                                      idx,
                                      gIdx,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              {/* Image Upload for Plan/Map/Diagram */}
                              {group.type === "plan-map-diagram" && (
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Image / Diagram
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id={`img-${idx}-${gIdx}`}
                                    className="hidden"
                                    onChange={(e) =>
                                      handleImageUpload(idx, gIdx, e)
                                    }
                                  />
                                  <label
                                    htmlFor={`img-${idx}-${gIdx}`}
                                    className={`block px-6 py-3 text-center rounded-xl cursor-pointer font-medium ${
                                      uploadingImage[`${idx}-${gIdx}`]
                                        ? "bg-gray-200"
                                        : group.sharedImageUrl
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {uploadingImage[`${idx}-${gIdx}`] ? (
                                      <>
                                        Uploading...{" "}
                                        <Loader2 className="inline animate-spin" />
                                      </>
                                    ) : group.sharedImageUrl ? (
                                      <>Image Uploaded ✓</>
                                    ) : (
                                      <>Upload Image</>
                                    )}
                                  </label>
                                  {group.sharedImageUrl && (
                                    <img
                                      src={group.sharedImageUrl}
                                      alt="Diagram"
                                      className="mt-3 max-h-48 object-contain border rounded-lg mx-auto"
                                    />
                                  )}
                                </div>
                              )}

                              {/* Questions */}
                              <div className="space-y-5">
                                {group.questions.map((q, qIdx) => (
                                  <div
                                    key={qIdx}
                                    className="p-4 bg-gray-50 border rounded-lg space-y-4"
                                  >
                                    <div className="font-semibold">
                                      Question #{qIdx + 1}
                                    </div>

                                    {/* Context Text (Edit uchun) */}
                                    <textarea
                                      value={q.contextText || ""}
                                      onChange={(e) =>
                                        updateQuestionField(
                                          idx,
                                          gIdx,
                                          qIdx,
                                          "contextText",
                                          e.target.value,
                                        )
                                      }
                                      rows={2}
                                      className="w-full px-4 py-2 border rounded-lg text-xs"
                                      placeholder="Context text (optional)..."
                                    />

                                    <input
                                      value={q.question}
                                      onChange={(e) =>
                                        updateQuestionField(
                                          idx,
                                          gIdx,
                                          qIdx,
                                          "question",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Question text..."
                                      className="w-full px-4 py-2 border rounded-lg"
                                    />

                                    {(group.type === "multiple-choice" ||
                                      group.type === "matching") && (
                                      <div className="grid grid-cols-2 gap-3">
                                        {Array(4)
                                          .fill(0)
                                          .map((_, optIdx) => (
                                            <input
                                              key={optIdx}
                                              value={q.options?.[optIdx] || ""}
                                              onChange={(e) =>
                                                updateOption(
                                                  idx,
                                                  gIdx,
                                                  qIdx,
                                                  optIdx,
                                                  e.target.value,
                                                )
                                              }
                                              placeholder={`Option ${String.fromCharCode(
                                                65 + optIdx,
                                              )}`}
                                              className="px-3 py-2 border rounded-lg"
                                            />
                                          ))}
                                      </div>
                                    )}

                                    <input
                                      value={q.correctAnswer}
                                      onChange={(e) =>
                                        updateQuestionField(
                                          idx,
                                          gIdx,
                                          qIdx,
                                          "correctAnswer",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Correct answer..."
                                      className="w-full px-4 py-2 border rounded-lg"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-200 rounded-xl font-bold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalQs !== 40}
              className="flex-1 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  Saving... <Loader2 className="animate-spin" />
                </>
              ) : (
                <>Save Changes ({totalQs}/40)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
