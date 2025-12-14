// hooks/useTestNotes.ts
import { useState, useEffect } from "react";

interface TestNotes {
  [questionNumber: number]: string;
}

export const useTestNotes = (testId: string) => {
  const [notes, setNotes] = useState<TestNotes>({});
  const storageKey = `listening-notes-${testId}`;

  // Load notes from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNotes = localStorage.getItem(storageKey);
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
      } catch (error) {
        console.error("Error loading notes:", error);
      }
    }
  }, [testId]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notes));
      } catch (error) {
        console.error("Error saving notes:", error);
      }
    }
  }, [notes, storageKey]);

  const saveNote = (questionNumber: number, note: string) => {
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

  const clearAllNotes = () => {
    setNotes({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  };

  return { notes, saveNote, clearAllNotes };
};
