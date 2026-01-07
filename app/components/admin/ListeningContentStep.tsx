"use client";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import { ListeningTest, ReadingTest, Section } from "../../../types/index";

interface ListeningContentStepProps {
  formData: ListeningTest;
  setFormData: React.Dispatch<
    React.SetStateAction<ReadingTest | ListeningTest>
  >;
  onBack: () => void;
  onSubmit: () => void;
}

export const ListeningContentStep: FC<ListeningContentStepProps> = ({
  formData,
  setFormData,
  onBack,
  onSubmit,
}) => {
  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...(formData.sections || []),
        {
          sectionNumber: (formData.sections?.length || 0) + 1,
          title: "",
          audioUrl: "",
          transcript: "",
          questions: [],
        },
      ],
    });
  };

  const updateSection = (
    index: number,
    field: keyof Section,
    value: string
  ) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = formData.sections.filter(
      (_: any, i: number) => i !== index
    );
    setFormData({ ...formData, sections: newSections });
  };

  const addQuestion = (sectionIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions.push({
      questionNumber: newSections[sectionIndex].questions.length + 1,
      question: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
    setFormData({ ...formData, sections: newSections });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm font-medium">
          🎧 Add audio sections and questions for your listening test
        </p>
      </div>

      {formData.sections?.map((section: Section, sIndex: number) => (
        <div
          key={sIndex}
          className="border border-gray-200 rounded-lg p-6 bg-gray-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Section {sIndex + 1}
            </h3>
            <button
              onClick={() => removeSection(sIndex)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Section 1: Conversation"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Audio URL
              </label>
              <input
                type="text"
                value={section.audioUrl}
                onChange={(e) =>
                  updateSection(sIndex, "audioUrl", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/audio.mp3"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Transcript
              </label>
              <textarea
                value={section.transcript}
                onChange={(e) =>
                  updateSection(sIndex, "transcript", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                placeholder="Enter the audio transcript here..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-700 font-medium">
                  Questions ({section.questions?.length || 0})
                </label>
                <button
                  onClick={() => addQuestion(sIndex)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              {section.questions?.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4 bg-white rounded border border-dashed border-gray-300">
                  No questions yet. Click "Add Question" to create one.
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Section
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
          disabled={!formData.sections || formData.sections.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Test
        </button>
      </div>
    </div>
  );
};
