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
  Check,
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

interface QuestionGroup {
  id: string;
  type: QuestionType;
  count: number;
  sharedImageUrl?: string;
  questions: Array<{
    question: string;
    options?: string[];
    correctAnswer: string;
  }>;
}

interface Section {
  sectionNumber: number;
  title: string;
  audioUrl: string;
  questionGroups: QuestionGroup[];
  totalQuestions: number;
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

export const AddListeningTestModal: FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [testName, setTestName] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [timeLimit, setTimeLimit] = useState(30);

  const [sections, setSections] = useState<Section[]>([
    {
      sectionNumber: 1,
      title: "",
      audioUrl: "",
      questionGroups: [],
      totalQuestions: 0,
    },
    {
      sectionNumber: 2,
      title: "",
      audioUrl: "",
      questionGroups: [],
      totalQuestions: 0,
    },
    {
      sectionNumber: 3,
      title: "",
      audioUrl: "",
      questionGroups: [],
      totalQuestions: 0,
    },
    {
      sectionNumber: 4,
      title: "",
      audioUrl: "",
      questionGroups: [],
      totalQuestions: 0,
    },
  ]);

  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const addQuestionGroup = (sectionIdx: number) => {
    const section = sections[sectionIdx];
    if (section.totalQuestions >= 10) {
      alert("Each section can have maximum 10 questions!");
      return;
    }

    const availableSlots = 10 - section.totalQuestions;
    const defaultCount = Math.min(5, availableSlots);

    const newGroup: QuestionGroup = {
      id: `group-${Date.now()}`,
      type: "short-answer",
      count: defaultCount,
      questions: Array(defaultCount)
        .fill(null)
        .map(() => ({
          question: "",
          correctAnswer: "",
        })),
    };

    const updated = [...sections];
    updated[sectionIdx].questionGroups.push(newGroup);
    updated[sectionIdx].totalQuestions += defaultCount;
    setSections(updated);
  };

  const updateGroupType = (
    sectionIdx: number,
    groupIdx: number,
    type: QuestionType
  ) => {
    const updated = [...sections];
    const group = updated[sectionIdx].questionGroups[groupIdx];
    group.type = type;

    // Add options if MCQ/Matching
    const needsOptions = type === "multiple-choice" || type === "matching";
    group.questions = group.questions.map((q) => ({
      ...q,
      options: needsOptions ? q.options || ["", "", "", ""] : undefined,
    }));

    setSections(updated);
  };

  const updateGroupCount = (
    sectionIdx: number,
    groupIdx: number,
    newCount: number
  ) => {
    const updated = [...sections];
    const group = updated[sectionIdx].questionGroups[groupIdx];
    const oldCount = group.count;
    const diff = newCount - oldCount;
    const newTotal = updated[sectionIdx].totalQuestions + diff;

    if (newTotal > 10) {
      alert("Each section must have exactly 10 questions!");
      return;
    }

    group.count = newCount;
    updated[sectionIdx].totalQuestions = newTotal;

    // Adjust questions array
    if (newCount > oldCount) {
      const needsOptions =
        group.type === "multiple-choice" || group.type === "matching";
      for (let i = 0; i < newCount - oldCount; i++) {
        group.questions.push({
          question: "",
          correctAnswer: "",
          options: needsOptions ? ["", "", "", ""] : undefined,
        });
      }
    } else {
      group.questions = group.questions.slice(0, newCount);
    }

    setSections(updated);
  };

  const updateQuestion = (
    sectionIdx: number,
    groupIdx: number,
    qIdx: number,
    field: string,
    value: any
  ) => {
    const updated = [...sections];
    // @ts-ignore
    updated[sectionIdx].questionGroups[groupIdx].questions[qIdx][field] = value;
    setSections(updated);
  };

  const updateOption = (
    sectionIdx: number,
    groupIdx: number,
    qIdx: number,
    optIdx: number,
    value: string
  ) => {
    const updated = [...sections];
    const q = updated[sectionIdx].questionGroups[groupIdx].questions[qIdx];
    if (!q.options) q.options = ["", "", "", ""];
    q.options[optIdx] = value;
    setSections(updated);
  };

  const deleteGroup = (sectionIdx: number, groupIdx: number) => {
    const updated = [...sections];
    const group = updated[sectionIdx].questionGroups[groupIdx];
    updated[sectionIdx].questionGroups.splice(groupIdx, 1);
    updated[sectionIdx].totalQuestions -= group.count;
    setSections(updated);
  };

  const handleAudioUpload = async (
    sectionIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `audio-${sectionIdx}`;
    setUploading({ ...uploading, [key]: true });

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const updated = [...sections];
        updated[sectionIdx].audioUrl = data.url;
        setSections(updated);
      }
    } catch (e) {
      alert("Upload failed");
    } finally {
      setUploading({ ...uploading, [key]: false });
    }
  };

  const handleImageUpload = async (
    sectionIdx: number,
    groupIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `image-${sectionIdx}-${groupIdx}`;
    setUploading({ ...uploading, [key]: true });

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const updated = [...sections];
        updated[sectionIdx].questionGroups[groupIdx].sharedImageUrl = data.url;
        setSections(updated);
      }
    } catch (e) {
      alert("Upload failed");
    } finally {
      setUploading({ ...uploading, [key]: false });
    }
  };

  const handleSubmit = async () => {
    if (!testName.trim()) {
      alert("Please enter test name!");
      return;
    }

    // Validate
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (section.totalQuestions !== 10) {
        alert(
          `Section ${i + 1} must have exactly 10 questions! (Currently: ${
            section.totalQuestions
          })`
        );
        return;
      }

      if (!section.audioUrl) {
        alert(`Section ${i + 1} needs audio file!`);
        return;
      }

      for (let j = 0; j < section.questionGroups.length; j++) {
        const group = section.questionGroups[j];
        for (let k = 0; k < group.questions.length; k++) {
          const q = group.questions[k];
          if (!q.question.trim()) {
            alert(
              `Section ${i + 1}, Group ${j + 1}, Question ${
                k + 1
              }: Enter question text!`
            );
            return;
          }
          if (!q.correctAnswer.trim()) {
            alert(
              `Section ${i + 1}, Group ${j + 1}, Question ${
                k + 1
              }: Enter correct answer!`
            );
            return;
          }
          if (
            (group.type === "multiple-choice" || group.type === "matching") &&
            q.options
          ) {
            if (q.options.some((opt) => !opt.trim())) {
              alert(
                `Section ${i + 1}, Group ${j + 1}, Question ${
                  k + 1
                }: Fill all options!`
              );
              return;
            }
          }
        }
      }
    }

    // Format for backend
    const sectionsForSubmit = sections.map((section) => {
      let questionNumber = (section.sectionNumber - 1) * 10 + 1;
      const allQuestions: any[] = [];

      section.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          allQuestions.push({
            questionNumber: questionNumber++,
            questionType: group.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 1,
            imageUrl: group.sharedImageUrl,
          });
        });
      });

      return {
        sectionNumber: section.sectionNumber,
        title: section.title || `Section ${section.sectionNumber}`,
        audioUrl: section.audioUrl,
        transcript: "",
        questions: allQuestions,
      };
    });

    const testToSubmit = {
      testName,
      difficulty,
      timeLimit,
      testType: "Academic",
      sections: sectionsForSubmit,
      totalQuestions: 40,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/listening`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testToSubmit),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Test created successfully!");
        onSuccess();
        onClose();
      } else {
        alert("Failed: " + data.error);
      }
    } catch (e) {
      alert("Error creating test");
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = sections.reduce((sum, s) => sum + s.totalQuestions, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-purple-500 to-purple-600 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-black text-white">
              Create Listening Test
            </h2>
            <p className="text-purple-100 text-sm">
              4 sections × 10 questions = 40 total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
              placeholder="Test Name *"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl"
              placeholder="Time (minutes)"
            />
          </div>

          {/* Progress */}
          <div className="mb-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900">Total Progress</span>
              <span className="text-2xl font-black text-purple-600">
                {totalQuestions} / 40
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-purple-500 to-purple-600 transition-all"
                style={{ width: `${(totalQuestions / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, sectionIdx) => (
              <div
                key={sectionIdx}
                className={`border-2 rounded-xl overflow-hidden ${
                  section.totalQuestions === 10
                    ? "border-green-400 bg-green-50"
                    : section.totalQuestions > 0
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                {/* Section Header */}
                <div
                  className={`p-6 cursor-pointer ${
                    section.totalQuestions === 10
                      ? "bg-green-100"
                      : section.totalQuestions > 0
                      ? "bg-yellow-100"
                      : "bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === sectionIdx ? null : sectionIdx
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                          section.totalQuestions === 10
                            ? "bg-green-500 text-white"
                            : section.totalQuestions > 0
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {section.sectionNumber}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">
                          Part {section.sectionNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {section.totalQuestions} / 10 questions
                          {section.totalQuestions === 10 && " ✓"}
                        </p>
                      </div>
                    </div>
                    {expandedSection === sectionIdx ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {expandedSection === sectionIdx && (
                  <div className="p-6 bg-white space-y-6">
                    {/* Section Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sectionIdx].title = e.target.value;
                          setSections(updated);
                        }}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg"
                        placeholder="Section Title (optional)"
                      />
                      <div>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioUpload(sectionIdx, e)}
                          className="hidden"
                          id={`audio-${sectionIdx}`}
                        />
                        <label
                          htmlFor={`audio-${sectionIdx}`}
                          className="block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 cursor-pointer text-center"
                        >
                          {uploading[`audio-${sectionIdx}`] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                              Uploading...
                            </>
                          ) : section.audioUrl ? (
                            <>
                              <Check className="w-4 h-4 inline mr-2" />
                              Audio Uploaded
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 inline mr-2" />
                              Upload Audio *
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Question Groups */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-black">
                          Question Groups ({section.totalQuestions}/10)
                        </h4>
                        <button
                          onClick={() => addQuestionGroup(sectionIdx)}
                          disabled={section.totalQuestions >= 10}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Group
                        </button>
                      </div>

                      <div className="space-y-4">
                        {section.questionGroups.map((group, groupIdx) => (
                          <div
                            key={group.id}
                            className="border-2 border-gray-300 rounded-lg overflow-hidden"
                          >
                            {/* Group Header */}
                            <div
                              className="p-4 bg-gray-100 cursor-pointer flex items-center justify-between"
                              onClick={() =>
                                setExpandedGroup(
                                  expandedGroup === group.id ? null : group.id
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                                  {group.count}Q
                                </div>
                                <span className="font-bold">
                                  {
                                    QUESTION_TYPES.find(
                                      (t) => t.value === group.type
                                    )?.label
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Delete this group?")) {
                                      deleteGroup(sectionIdx, groupIdx);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {expandedGroup === group.id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </div>
                            </div>

                            {/* Group Content */}
                            {expandedGroup === group.id && (
                              <div className="p-4 bg-white space-y-4">
                                {/* Group Settings */}
                                <div className="grid grid-cols-2 gap-4">
                                  <select
                                    value={group.type}
                                    onChange={(e) =>
                                      updateGroupType(
                                        sectionIdx,
                                        groupIdx,
                                        e.target.value as QuestionType
                                      )
                                    }
                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                                  >
                                    {QUESTION_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={group.count}
                                    onChange={(e) =>
                                      updateGroupCount(
                                        sectionIdx,
                                        groupIdx,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                                  />
                                </div>

                                {/* Image Upload for Map/Diagram */}
                                {group.type === "plan-map-diagram" && (
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleImageUpload(
                                          sectionIdx,
                                          groupIdx,
                                          e
                                        )
                                      }
                                      className="hidden"
                                      id={`image-${sectionIdx}-${groupIdx}`}
                                    />
                                    <label
                                      htmlFor={`image-${sectionIdx}-${groupIdx}`}
                                      className="block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 cursor-pointer text-center"
                                    >
                                      {uploading[
                                        `image-${sectionIdx}-${groupIdx}`
                                      ] ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                          Uploading...
                                        </>
                                      ) : group.sharedImageUrl ? (
                                        <>
                                          <Check className="w-4 h-4 inline mr-2" />
                                          Image Uploaded
                                        </>
                                      ) : (
                                        <>
                                          <ImageIcon className="w-4 h-4 inline mr-2" />
                                          Upload Map/Diagram
                                        </>
                                      )}
                                    </label>
                                    {group.sharedImageUrl && (
                                      <img
                                        src={group.sharedImageUrl}
                                        alt="Map"
                                        className="mt-2 w-full max-h-40 object-contain border-2 rounded-lg"
                                      />
                                    )}
                                  </div>
                                )}

                                {/* Questions */}
                                <div className="space-y-3">
                                  {group.questions.map((q, qIdx) => (
                                    <div
                                      key={qIdx}
                                      className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg"
                                    >
                                      <div className="font-bold mb-2">
                                        Question {qIdx + 1}
                                      </div>
                                      <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) =>
                                          updateQuestion(
                                            sectionIdx,
                                            groupIdx,
                                            qIdx,
                                            "question",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg mb-3"
                                        placeholder="Question text *"
                                      />

                                      {(group.type === "multiple-choice" ||
                                        group.type === "matching") && (
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                          {[0, 1, 2, 3].map((optIdx) => (
                                            <input
                                              key={optIdx}
                                              type="text"
                                              value={q.options?.[optIdx] || ""}
                                              onChange={(e) =>
                                                updateOption(
                                                  sectionIdx,
                                                  groupIdx,
                                                  qIdx,
                                                  optIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                                              placeholder={`Option ${String.fromCharCode(
                                                65 + optIdx
                                              )}`}
                                            />
                                          ))}
                                        </div>
                                      )}

                                      <input
                                        type="text"
                                        value={q.correctAnswer}
                                        onChange={(e) =>
                                          updateQuestion(
                                            sectionIdx,
                                            groupIdx,
                                            qIdx,
                                            "correctAnswer",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                                        placeholder="Correct answer *"
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
          </div>

          {/* Submit */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalQuestions !== 40}
              className="flex-1 px-6 py-4 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create Test (${totalQuestions}/40)`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
