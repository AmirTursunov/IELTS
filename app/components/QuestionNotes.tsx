// components/QuestionNotes.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { StickyNote, X, Save, Edit3 } from "lucide-react";

interface QuestionNotesProps {
  questionNumber: number;
  initialNote?: string;
  onSaveNote: (questionNumber: number, note: string) => void;
}

export const QuestionNotes: React.FC<QuestionNotesProps> = ({
  questionNumber,
  initialNote = "",
  onSaveNote,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [hasNote, setHasNote] = useState(!!initialNote);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNote(initialNote);
    setHasNote(!!initialNote);
  }, [initialNote]);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    onSaveNote(questionNumber, note.trim());
    setHasNote(!!note.trim());

    setTimeout(() => {
      setIsSaving(false);
      setIsOpen(false);
    }, 300);
  };

  const handleClear = () => {
    setNote("");
    onSaveNote(questionNumber, "");
    setHasNote(false);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Note Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative p-1.5 rounded-lg transition-all ${
          hasNote
            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
        }`}
        title={hasNote ? "View/Edit note" : "Add note"}
      >
        <StickyNote size={14} className={hasNote ? "fill-yellow-400" : ""} />

        {/* Note indicator dot */}
        {hasNote && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-white animate-pulse"></span>
        )}
      </button>

      {/* Note Popup */}
      {isOpen && (
        <div className="absolute z-50 top-8 left-0 w-72 bg-white rounded-xl shadow-2xl border-2 border-yellow-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-linear-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
            <div className="flex items-center gap-2">
              <StickyNote size={16} className="text-yellow-600" />
              <span className="text-sm font-bold text-gray-800">
                Note - Q{questionNumber}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Note Input */}
          <div className="p-3">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here...
Tips, reminders, or anything helpful!"
              className="w-full h-32 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              maxLength={500}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {note.length}/500
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-3 pb-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </button>
            {hasNote && (
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick tips */}
          {!note && (
            <div className="px-3 pb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  💡 <span className="font-semibold">Quick Tips:</span>
                </p>
                <ul className="mt-1 text-xs text-blue-700 space-y-0.5 ml-3">
                  <li>• Note key words from audio</li>
                  <li>• Mark questions to review</li>
                  <li>• Write down uncertainties</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
