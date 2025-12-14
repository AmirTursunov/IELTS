"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp, Save } from "lucide-react";

const API_BASE = "/api";

type QuestionType =
  | "multiple-choice"
  | "true-false-not-given"
  | "matching"
  | "sentence-completion"
  | "short-answer";

interface Question {
  questionNumber: number;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

interface Passage {
  passageNumber: number;
  title: string;
  content: string;
  questions: Question[];
}

interface ReadingTest {
  _id?: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  passages: Passage[];
  totalQuestions: number;
}

interface EditTestModalProps {
  test: ReadingTest;
  onClose: () => void;
  onSuccess: () => void;
}

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false-not-given", label: "True/False/Not Given" },
  { value: "matching", label: "Matching" },
  { value: "sentence-completion", label: "Sentence Completion" },
  { value: "short-answer", label: "Short Answer" },
];

export function EditTestModal({
  test,
  onClose,
  onSuccess,
}: EditTestModalProps) {
  // Fetch full test data from API to ensure correctAnswer is included
  const [formData, setFormData] = useState<ReadingTest | null>(null);
  const [expandedPassage, setExpandedPassage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchFullTestData = async () => {
      try {
        setLoadingData(true);
        const response = await fetch(`${API_BASE}/reading/${test._id}`);
        const result = await response.json();

        if (result.success) {
          console.log("Fetched full test data:", result.data);
          setFormData(result.data);
        } else {
          console.error("Failed to fetch test data:", result.error);
          setFormData(test); // Fallback to passed test
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
        setFormData(test); // Fallback to passed test
      } finally {
        setLoadingData(false);
      }
    };

    fetchFullTestData();
  }, [test]);

  const getCorrectAnswerAsString = (
    correctAnswer: string | string[] | undefined
  ): string => {
    if (!correctAnswer) return "";
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.join(", ");
    }
    return correctAnswer;
  };

  const updatePassage = (index: number, field: keyof Passage, value: any) => {
    if (!formData) return;
    const passages = [...formData.passages];
    passages[index] = { ...passages[index], [field]: value };
    setFormData({ ...formData, passages });
  };

  const addPassage = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      passages: [
        ...formData.passages,
        {
          passageNumber: formData.passages.length + 1,
          title: "",
          content: "",
          questions: [],
        },
      ],
    });
  };

  const removePassage = (index: number) => {
    if (!formData) return;
    const newPassages = formData.passages.filter((_, i) => i !== index);
    setFormData({ ...formData, passages: newPassages });
  };

  const addQuestion = (passageIndex: number) => {
    if (!formData) return;
    const passages = [...formData.passages];
    const allQuestions = passages.reduce(
      (sum, p) => sum + p.questions.length,
      0
    );

    const newQuestion: Question = {
      questionNumber: allQuestions + 1,
      questionType: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    };

    passages[passageIndex].questions.push(newQuestion);
    setFormData({ ...formData, passages });
  };

  const updateQuestion = (
    passageIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    if (!formData) return;
    const passages = [...formData.passages];
    passages[passageIndex].questions[questionIndex] = {
      ...passages[passageIndex].questions[questionIndex],
      [field]: value,
    };
    setFormData({ ...formData, passages });
  };

  const deleteQuestion = (passageIndex: number, questionIndex: number) => {
    if (!formData) return;
    const passages = [...formData.passages];
    passages[passageIndex].questions = passages[passageIndex].questions.filter(
      (_, i) => i !== questionIndex
    );

    // Renumber questions
    let questionNumber = 1;
    passages.forEach((passage) => {
      passage.questions.forEach((q) => {
        q.questionNumber = questionNumber++;
      });
    });

    setFormData({ ...formData, passages });
  };

  const handleSave = async () => {
    if (!formData) return;

    if (!formData.title.trim()) {
      alert("Test title is required!");
      return;
    }

    const totalQuestions = formData.passages.reduce(
      (sum, p) => sum + p.questions.length,
      0
    );

    if (totalQuestions === 0) {
      alert("Please add at least one question!");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        totalQuestions,
      };

      console.log("Saving test data:", JSON.stringify(dataToSave, null, 2));

      const response = await fetch(`${API_BASE}/reading/${test._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (result.success) {
        alert("Test updated successfully!");
        onSuccess();
        onClose();
      } else {
        alert("Error: " + (result.error || "Failed to update test"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Network error occurred!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  const totalQuestionsCount = formData.passages.reduce(
    (sum, p) => sum + p.questions.length,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Reading Test
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Total Questions: {totalQuestionsCount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Academic Reading Test 1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as
                          | "Easy"
                          | "Medium"
                          | "Hard",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Time Limit (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Test Type *
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
          </div>

          {/* Passages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Passages</h3>

            {formData.passages.map((passage, pIdx) => (
              <div
                key={pIdx}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedPassage(expandedPassage === pIdx ? null : pIdx)
                  }
                >
                  <div>
                    <h4 className="text-lg font-semibold">
                      Passage {pIdx + 1}
                    </h4>
                    <p className="text-sm text-blue-100">
                      {passage.questions.length} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePassage(pIdx);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedPassage === pIdx ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedPassage === pIdx && (
                  <div className="p-6 bg-white space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Passage Title *
                      </label>
                      <input
                        type="text"
                        value={passage.title}
                        onChange={(e) =>
                          updatePassage(pIdx, "title", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter passage title"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Passage Content *
                      </label>
                      <textarea
                        value={passage.content}
                        onChange={(e) =>
                          updatePassage(pIdx, "content", e.target.value)
                        }
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Paste passage text here..."
                      />
                    </div>

                    {/* Questions */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-700">
                          Questions
                        </h5>
                        <button
                          onClick={() => addQuestion(pIdx)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <Plus size={18} />
                          Add Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {passage.questions.map((question, qIdx) => (
                          <div
                            key={qIdx}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-gray-700">
                                Question {question.questionNumber}
                              </span>
                              <button
                                onClick={() => deleteQuestion(pIdx, qIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Question Type
                                </label>
                                <select
                                  value={question.questionType}
                                  onChange={(e) =>
                                    updateQuestion(
                                      pIdx,
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
                                      pIdx,
                                      qIdx,
                                      "question",
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="Enter question"
                                />
                              </div>

                              {question.questionType === "multiple-choice" && (
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Options
                                  </label>
                                  {question.options?.map((opt, oIdx) => (
                                    <input
                                      key={oIdx}
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(question.options || []),
                                        ];
                                        newOptions[oIdx] = e.target.value;
                                        updateQuestion(
                                          pIdx,
                                          qIdx,
                                          "options",
                                          newOptions
                                        );
                                      }}
                                      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg"
                                      placeholder={`Option ${String.fromCharCode(
                                        65 + oIdx
                                      )}`}
                                    />
                                  ))}
                                </div>
                              )}

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Correct Answer *
                                </label>
                                <input
                                  type="text"
                                  value={getCorrectAnswerAsString(
                                    question.correctAnswer
                                  )}
                                  onChange={(e) =>
                                    updateQuestion(
                                      pIdx,
                                      qIdx,
                                      "correctAnswer",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="Enter correct answer"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  For multiple answers, separate with commas
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {passage.questions.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <p>No questions added yet</p>
                            <p className="text-sm">
                              Click &quot;Add Question&quot; to start
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addPassage}
              className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium"
            >
              + Add New Passage
            </button>
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
              onClick={handleSave}
              disabled={loading || !formData.title.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
