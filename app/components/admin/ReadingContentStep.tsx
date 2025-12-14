"use client";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import { ReadingTest, ListeningTest, Passage } from "../../../types/index";

interface ReadingContentStepProps {
  formData: ReadingTest;
  setFormData: React.Dispatch<
    React.SetStateAction<ReadingTest | ListeningTest>
  >;
  onBack: () => void;
  onSubmit: () => void;
}

export const ReadingContentStep: FC<ReadingContentStepProps> = ({
  formData,
  setFormData,
  onBack,
  onSubmit,
}) => {
  const addPassage = () => {
    setFormData({
      ...formData,
      passages: [
        ...(formData.passages || []),
        {
          passageNumber: (formData.passages?.length || 0) + 1,
          title: "",
          content: "",
          questions: [],
        },
      ],
    });
  };

  const updatePassage = (
    index: number,
    field: keyof Passage,
    value: string
  ) => {
    const newPassages = [...formData.passages];
    newPassages[index] = { ...newPassages[index], [field]: value };
    setFormData({ ...formData, passages: newPassages });
  };

  const removePassage = (index: number) => {
    const newPassages = formData.passages.filter((_, i) => i !== index);
    setFormData({ ...formData, passages: newPassages });
  };

  const addQuestion = (passageIndex: number) => {
    const newPassages = [...formData.passages];

    newPassages[passageIndex].questions.push({
      questionNumber: newPassages[passageIndex].questions.length + 1,
      question: "", // ✅ questionText EMAS
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1, // ✅ interface talab qiladi
    });

    setFormData({ ...formData, passages: newPassages });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm font-medium">
          📝 Add passages and questions for your reading test
        </p>
      </div>

      {formData.passages?.map((passage, pIndex) => (
        <div
          key={pIndex}
          className="border border-gray-200 rounded-lg p-6 bg-gray-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Passage {pIndex + 1}
            </h3>
            <button
              onClick={() => removePassage(pIndex)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Passage Title
              </label>
              <input
                type="text"
                value={passage.title}
                onChange={(e) => updatePassage(pIndex, "title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., The History of Coffee"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Passage Content
              </label>
              <textarea
                value={passage.content}
                onChange={(e) =>
                  updatePassage(pIndex, "content", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                placeholder="Enter the reading passage text here..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-700 font-medium">
                  Questions ({passage.questions?.length || 0})
                </label>
                <button
                  onClick={() => addQuestion(pIndex)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              {passage.questions?.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4 bg-white rounded border border-dashed border-gray-300">
                  No questions yet. Click "Add Question" to create one.
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addPassage}
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Passage
      </button>

      <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.passages || formData.passages.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Test
        </button>
      </div>
    </div>
  );
};
