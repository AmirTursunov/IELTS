"use client";
import React, { FC, useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Save,
  List,
} from "lucide-react";
// TextFormatter Component with MULTILINE MARGIN support
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

  // Split by lines
  const lines = text.split("\n");

  const processLine = (line: string, lineIndex: number): React.ReactNode => {
    // Check if line starts with margin syntax: 1r, 2r, 3r, etc.
    const marginMatch = line.match(/^(\d+)r\s+(.*)$/);

    let marginLeft = 0;
    let contentToProcess = line;

    if (marginMatch) {
      marginLeft = parseInt(marginMatch[1], 10);
      contentToProcess = marginMatch[2];
    }

    // Process formatting
    const allMatches: Match[] = [];
    let match: RegExpExecArray | null;

    const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
    while ((match = boldItalicRegex.exec(contentToProcess)) !== null) {
      allMatches.push({
        type: "bold-italic",
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      });
    }

    const boldRegex = /\*\*(.*?)\*\*/g;
    while ((match = boldRegex.exec(contentToProcess)) !== null) {
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

    const italicRegex = /\*(.*?)\*/g;
    while ((match = italicRegex.exec(contentToProcess)) !== null) {
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

    const underlineRegex = /__(.*?)__/g;
    while ((match = underlineRegex.exec(contentToProcess)) !== null) {
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

    allMatches.sort((a, b) => a.start - b.start);

    let currentIndex = 0;
    const result: React.ReactNode[] = [];

    allMatches.forEach((m, idx) => {
      if (m.start > currentIndex) {
        result.push(
          <React.Fragment key={`text-${lineIndex}-${currentIndex}`}>
            {contentToProcess.slice(currentIndex, m.start)}
          </React.Fragment>,
        );
      }

      switch (m.type) {
        case "bold":
          result.push(
            <strong key={`match-${lineIndex}-${idx}`}>{m.text}</strong>,
          );
          break;
        case "italic":
          result.push(<em key={`match-${lineIndex}-${idx}`}>{m.text}</em>);
          break;
        case "underline":
          result.push(<u key={`match-${lineIndex}-${idx}`}>{m.text}</u>);
          break;
        case "bold-italic":
          result.push(
            <strong key={`match-${lineIndex}-${idx}`}>
              <em>{m.text}</em>
            </strong>,
          );
          break;
      }

      currentIndex = m.end;
    });

    if (currentIndex < contentToProcess.length) {
      result.push(
        <React.Fragment key={`text-${lineIndex}-${currentIndex}`}>
          {contentToProcess.slice(currentIndex)}
        </React.Fragment>,
      );
    }

    // Return with or without margin
    if (marginLeft > 0) {
      return (
        <div
          key={`line-${lineIndex}`}
          style={{ marginLeft: `${marginLeft}rem` }}
        >
          {result}
        </div>
      );
    }

    return <React.Fragment key={`line-${lineIndex}`}>{result}</React.Fragment>;
  };

  // Process all lines
  const processedLines = lines.map((line, idx) => processLine(line, idx));

  // Join with line breaks
  const resultWithBreaks: React.ReactNode[] = [];
  processedLines.forEach((line, idx) => {
    resultWithBreaks.push(line);
    if (idx < processedLines.length - 1) {
      resultWithBreaks.push(<br key={`br-${idx}`} />);
    }
  });

  return <span className={className}>{resultWithBreaks}</span>;
};

const API_BASE = "/api";

// IELTS STANDART INSTRUKSIYALARI
const COMMON_INSTRUCTIONS = [
  "Choose the correct letter, A, B, C or D.",
  "Write TRUE, FALSE or NOT GIVEN.",
  "Write YES, NO or NOT GIVEN.", // <--- YANGI
  "Choose the correct heading for each section from the list of headings below.",
  "Complete the summary using the list of words below.",
  "Match each statement with the correct person below.",
  "Which paragraph contains the following information?",
  "Write NO MORE THAN TWO WORDS for each answer.",
  "Complete the sentences below.",
  "Label the diagram below.",
];

// BARCHA REAL IELTS SAVOL TURLARI
type QuestionType =
  | "multiple-choice"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching-headings"
  | "matching-headings-drag-drop"
  | "matching-sentence-endings"
  | "matching-features"
  | "matching-information"
  | "summary-completion"
  | "summary-completion-box"
  | "note-completion"
  | "sentence-completion"
  | "diagram-labeling"
  | "matching"
  | "short-answer";

interface Question {
  questionNumber?: number;
  questionType: QuestionType;
  question: string;
  contextText?: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface QuestionGroup {
  id: string;
  type: QuestionType;
  count: number;
  instruction: string;
  sharedOptions?: string[]; // Guruh uchun umumiy variantlar (Box/List)
  questions: Question[];
}

interface Passage {
  passageNumber: number;
  title: string;
  content: string;
  hasParagraphs?: boolean;
  hasInputParagraphs?: boolean;
  paragraphs?: string[];
  questionGroups: QuestionGroup[];
}

interface ReadingTestForm {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  status: "paid" | "free";
  passages: Passage[];
}

interface EditTestModalProps {
  test: any; // Test data
  onClose: () => void;
  onSuccess: () => void;
}

// UI UCHUN SELECTION RO'YXATI
const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false-not-given", label: "True / False / Not Given" },
  { value: "yes-no-not-given", label: "Yes / No / Not Given" },
  { value: "matching-headings", label: "Matching Headings (List)" },
  {
    value: "matching-headings-drag-drop",
    label: "Matching Headings (Drag & Drop)",
  },
  { value: "matching-sentence-endings", label: "Matching Sentence Endings" },
  { value: "matching-features", label: "Matching Features (Names/Dates)" },
  { value: "matching-information", label: "Matching Information (Paragraphs)" },
  { value: "summary-completion", label: "Summary Completion (No Box)" },
  { value: "summary-completion-box", label: "Summary Completion (With Box)" },
  { value: "note-completion", label: "Note Completion" },
  { value: "sentence-completion", label: "Sentence Completion" },
  { value: "diagram-labeling", label: "Diagram / Flowchart Labeling" },
  { value: "short-answer", label: "Short Answer" },
];

export const EditTestModal: FC<EditTestModalProps> = ({
  test,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ReadingTestForm | null>(null);
  const [expandedPassage, setExpandedPassage] = useState<number | null>(0);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Test data'ni yuklash va grouping qilish
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoadingData(true);
        // Full data olish
        const res = await fetch(`${API_BASE}/reading/${test._id}`);
        const data = await res.json();
        const rawTest = data.success ? data.data : test;

        // Flat questions'ni grouping qilish
        const processedPassages = rawTest.passages.map((p: any) => {
          const groups: QuestionGroup[] = [];
          const rawQuestions: any[] = p.questions || [];

          if (rawQuestions.length > 0) {
            let currentGroup: QuestionGroup | null = null;

            rawQuestions.forEach((q: any) => {
              const isTypeChanged =
                !currentGroup || currentGroup.type !== q.questionType;
              const isInstructionChanged =
                !currentGroup ||
                (currentGroup.instruction || "") !== (q.instruction || "");

              if (isTypeChanged || isInstructionChanged) {
                if (currentGroup) groups.push(currentGroup);
                console.log(
                  "Loading instruction for question:",
                  q.questionNumber,
                  "instruction:",
                  q.instruction,
                );
                currentGroup = {
                  id: `g-${Date.now()}-${Math.random()}`,
                  type: q.questionType,
                  count: 1,
                  instruction: q.instruction || "",
                  sharedOptions:
                    q.options && Array.isArray(q.options) ? q.options : [],
                  questions: [
                    {
                      questionType: q.questionType,
                      question: q.question,
                      contextText: q.contextText || "",
                      options: q.options,
                      correctAnswer: q.correctAnswer,
                      points: q.points || 1,
                    },
                  ],
                };
              } else {
                currentGroup!.count++;
                currentGroup!.questions.push({
                  questionType: q.questionType,
                  question: q.question,
                  contextText: q.contextText || "",
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  points: q.points || 1,
                });
              }
            });

            if (currentGroup) groups.push(currentGroup);
          }

          return {
            passageNumber: p.passageNumber,
            title: p.title,
            content: p.content,
            hasParagraphs: p.hasParagraphs || false,
            hasInputParagraphs: p.hasInputParagraphs || false,
            paragraphs: p.paragraphs || [],
            questionGroups: groups,
          };
        });

        setFormData({
          _id: rawTest._id,
          title: rawTest.title,
          difficulty: rawTest.difficulty,
          timeLimit: rawTest.timeLimit,
          testType: rawTest.testType,
          status: rawTest.status || "paid",
          passages: processedPassages,
        } as any);
      } catch (error) {
        console.error("Error loading test:", error);
        alert("Failed to load test data");
      } finally {
        setLoadingData(false);
      }
    };

    loadTestData();
  }, [test._id]);

  if (loadingData || !formData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#9C74FF]" />
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  // --- LOGIC ---
  const updatePassage = (index: number, field: keyof Passage, value: any) => {
    const newPassages = [...formData.passages];
    // @ts-ignore
    newPassages[index][field] = value;
    setFormData({ ...formData, passages: newPassages });
  };

  const addGroup = (passageIndex: number) => {
    const newPassages = [...formData.passages];
    const newGroup: QuestionGroup = {
      id: `g-${Date.now()}`,
      type: "multiple-choice",
      count: 1,
      instruction: "Choose the correct letter, A, B, C or D.",
      sharedOptions: [],
      questions: [
        {
          questionType: "multiple-choice",
          question: "",
          contextText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1,
        },
      ],
    };
    newPassages[passageIndex].questionGroups.push(newGroup);
    setFormData({ ...formData, passages: newPassages });
    setExpandedGroup(newGroup.id);
  };

  const removeGroup = (pIdx: number, gIdx: number) => {
    if (!confirm("Delete this group?")) return;
    const ps = [...formData.passages];
    ps[pIdx].questionGroups.splice(gIdx, 1);
    setFormData({ ...formData, passages: ps });
  };

  const updateGroupField = (
    pIdx: number,
    gIdx: number,
    field: keyof QuestionGroup,
    value: any,
  ) => {
    const ps = [...formData.passages];
    const gr = ps[pIdx].questionGroups[gIdx];

    if (field === "type") {
      gr.type = value;
      // --- AUTO INSTRUCTION ASSIGNMENT ---
      switch (value) {
        case "multiple-choice":
          gr.instruction = "Choose the correct letter, A, B, C or D.";
          break;
        case "true-false-not-given":
          gr.instruction = "Write TRUE, FALSE or NOT GIVEN.";
          break;
        case "yes-no-not-given":
          gr.instruction = "Write YES, NO or NOT GIVEN.";
          break;
        case "matching-headings":
          gr.instruction =
            "Choose the correct heading for each section from the list of headings below.";
          break;
        case "matching-headings-drag-drop":
          gr.instruction =
            "The passage has several paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below by dragging and dropping.";
          break;
        case "matching-sentence-endings":
          gr.instruction =
            "Complete each sentence with the correct ending below.";
          break;
        case "matching-features":
          gr.instruction =
            "Match each statement with the correct person below.";
          break;
        case "matching-information":
          gr.instruction =
            "Which paragraph contains the following information?";
          break;
        case "summary-completion-box":
          gr.instruction =
            "Complete the summary using the list of words below.";
          break;
        case "note-completion":
          gr.instruction = "Complete the notes below.";
          break;
        case "diagram-labeling":
          gr.instruction = "Label the diagram below.";
          break;
        default:
          gr.instruction = "Write NO MORE THAN TWO WORDS.";
      }

      // Initialize shared options for types that need it
      const typesWithSharedOptions = [
        "matching-headings",
        "matching-headings-drag-drop",
        "matching-sentence-endings",
        "matching-features",
        "summary-completion-box",
      ];
      if (typesWithSharedOptions.includes(value)) {
        if (!gr.sharedOptions || gr.sharedOptions.length === 0) {
          gr.sharedOptions = [""];
        }
      }

      // Update questions inside
      const needsIndivOptions =
        value === "multiple-choice" || value === "matching"; // Matching (General)
      gr.questions = gr.questions.map((q) => ({
        ...q,
        questionType: value,
        options: needsIndivOptions ? q.options || ["", "", "", ""] : undefined,
      }));
    } else if (field === "count") {
      const num = Number(value);
      if (num < 1) return;
      const diff = num - gr.questions.length;
      if (diff > 0) {
        const needsIndivOptions =
          gr.type === "multiple-choice" || gr.type === "matching";
        for (let i = 0; i < diff; i++) {
          gr.questions.push({
            questionType: gr.type,
            question: "",
            contextText: "",
            options: needsIndivOptions ? ["", "", "", ""] : undefined,
            correctAnswer: "",
            points: 1,
          });
        }
      } else {
        gr.questions = gr.questions.slice(0, num);
      }
      gr.count = num;
    } else {
      // @ts-ignore
      gr[field] = value;
    }
    setFormData({ ...formData, passages: ps });
  };

  // --- SHARED OPTIONS LOGIC ---
  const addSharedOption = (pIdx: number, gIdx: number) => {
    const ps = [...formData.passages];
    const gr = ps[pIdx].questionGroups[gIdx];
    if (!gr.sharedOptions) gr.sharedOptions = [];
    gr.sharedOptions.push("");
    setFormData({ ...formData, passages: ps });
  };

  const updateSharedOption = (
    pIdx: number,
    gIdx: number,
    oIdx: number,
    val: string,
  ) => {
    const ps = [...formData.passages];
    const gr = ps[pIdx].questionGroups[gIdx];
    if (gr.sharedOptions) gr.sharedOptions[oIdx] = val;
    setFormData({ ...formData, passages: ps });
  };

  const removeSharedOption = (pIdx: number, gIdx: number, oIdx: number) => {
    const ps = [...formData.passages];
    const gr = ps[pIdx].questionGroups[gIdx];
    if (gr.sharedOptions && gr.sharedOptions.length > 1) {
      gr.sharedOptions.splice(oIdx, 1);
      setFormData({ ...formData, passages: ps });
    }
  };

  // --- QUESTION LOGIC ---
  const updateQuestion = (
    pIdx: number,
    gIdx: number,
    qIdx: number,
    field: keyof Question,
    value: any,
  ) => {
    const ps = [...formData.passages];
    // @ts-ignore
    ps[pIdx].questionGroups[gIdx].questions[qIdx][field] = value;
    setFormData({ ...formData, passages: ps });
  };

  const updateOption = (
    pIdx: number,
    gIdx: number,
    qIdx: number,
    oIdx: number,
    value: string,
  ) => {
    const ps = [...formData.passages];
    if (ps[pIdx].questionGroups[gIdx].questions[qIdx].options) {
      // @ts-ignore
      ps[pIdx].questionGroups[gIdx].questions[qIdx].options[oIdx] = value;
      setFormData({ ...formData, passages: ps });
    }
  };

  const addOption = (pIdx: number, gIdx: number, qIdx: number) => {
    const ps = [...formData.passages];
    const q = ps[pIdx].questionGroups[gIdx].questions[qIdx];
    if (!q.options) q.options = [];
    q.options.push("");
    setFormData({ ...formData, passages: ps });
  };

  const removeOption = (
    pIdx: number,
    gIdx: number,
    qIdx: number,
    oIdx: number,
  ) => {
    const ps = [...formData.passages];
    const q = ps[pIdx].questionGroups[gIdx].questions[qIdx];
    if (q.options && q.options.length > 2) q.options.splice(oIdx, 1);
    setFormData({ ...formData, passages: ps });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return alert("Title required!");
    let totalQs = 0;

    const processedPassages = formData.passages.map((p) => {
      const flatQuestions: any[] = [];
      p.questionGroups.forEach((g) => {
        g.questions.forEach((q) => {
          totalQs++;

          // Agar Shared Optionli savol bo'lsa, variantlarni birlashtiramiz
          let finalOptions = q.options;
          const typesWithShared = [
            "matching-headings",
            "matching-sentence-endings",
            "matching-features",
            "summary-completion-box",
          ];
          if (typesWithShared.includes(g.type)) {
            finalOptions = g.sharedOptions;
          }

          flatQuestions.push({
            questionNumber: totalQs,
            questionType: g.type,
            instruction: g.instruction,
            contextText: q.contextText || "",
            question: q.question,
            options: finalOptions,
            correctAnswer: q.correctAnswer,
            points: 1,
          });
        });
      });
      return {
        ...p,
        questions: flatQuestions,
        hasParagraphs: p.hasParagraphs || false,
        hasInputParagraphs: p.hasInputParagraphs || false,
        paragraphs: p.paragraphs || [],
        content: p.hasParagraphs
          ? (p.paragraphs || []).join("\n\n")
          : p.content,
      };
    });

    if (totalQs === 0) return alert("Add questions!");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reading/${(formData as any)._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          passages: processedPassages,
          totalQuestions: totalQs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else alert(data.error);
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  const currentTotalQs = formData.passages.reduce(
    (sum, p) => sum + p.questionGroups.reduce((s, g) => s + g.count, 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full shadow-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">Edit Reading Test</h2>
            <p className="text-gray-500">{currentTotalQs} questions</p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl border">
            <input
              className="px-4 py-3 border rounded-lg"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <select
              className="px-4 py-3 border rounded-lg"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value as any })
              }
            >
              <option value="Medium">Medium</option>
              <option value="Easy">Easy</option>
              <option value="Hard">Hard</option>
            </select>
            <input
              type="number"
              className="px-4 py-3 border rounded-lg"
              placeholder="Time (min)"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({ ...formData, timeLimit: Number(e.target.value) })
              }
            />
            <select
              className="px-4 py-3 border rounded-lg"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
            >
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </div>

          <div className="space-y-6">
            {formData.passages.map((passage, pIdx) => (
              <div
                key={pIdx}
                className="border-2 border-blue-100 rounded-xl overflow-hidden"
              >
                <div
                  className="bg-blue-50 p-4 flex justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedPassage(expandedPassage === pIdx ? null : pIdx)
                  }
                >
                  <h3 className="font-bold text-blue-800">
                    Passage {pIdx + 1}
                  </h3>
                  {expandedPassage === pIdx ? <ChevronUp /> : <ChevronDown />}
                </div>

                {expandedPassage === pIdx && (
                  <div className="p-6 bg-white space-y-6">
                    <input
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Passage Title"
                      value={passage.title}
                      onChange={(e) =>
                        updatePassage(pIdx, "title", e.target.value)
                      }
                    />

                    {/* Passage Type Selector */}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="font-bold text-gray-700">
                        Passage Type:
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            !passage.hasParagraphs &&
                            !passage.hasInputParagraphs
                          }
                          onChange={() => {
                            if (!formData) return;
                            const ps = [...formData.passages];
                            ps[pIdx].hasParagraphs = false;
                            ps[pIdx].hasInputParagraphs = false;
                            ps[pIdx].paragraphs = [];
                            setFormData({ ...formData, passages: ps });
                          }}
                          className="text-blue-600"
                        />
                        <span className="font-medium">Normal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={
                            passage.hasParagraphs && !passage.hasInputParagraphs
                          }
                          onChange={() => {
                            if (!formData) return;
                            const ps = [...formData.passages];
                            ps[pIdx].hasParagraphs = true;
                            ps[pIdx].hasInputParagraphs = false;
                            ps[pIdx].paragraphs = ["", "", ""];
                            setFormData({ ...formData, passages: ps });
                          }}
                          className="text-blue-600"
                        />
                        <span className="font-medium">With Paragraphs</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={passage.hasInputParagraphs}
                          onChange={() => {
                            if (!formData) return;
                            const ps = [...formData.passages];
                            ps[pIdx].hasParagraphs = true;
                            ps[pIdx].hasInputParagraphs = true;
                            ps[pIdx].paragraphs = ["", "", ""];
                            setFormData({ ...formData, passages: ps });
                          }}
                          className="text-blue-600"
                        />
                        <span className="font-medium">
                          With Input Paragraphs
                        </span>
                      </label>
                    </div>

                    {/* Agar With Paragraphs bo'lsa */}
                    {passage.hasParagraphs ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-gray-700">
                            Paragraphs
                          </h4>
                          <button
                            onClick={() => {
                              if (!formData) return;
                              const ps = [...formData.passages];
                              ps[pIdx].paragraphs = [
                                ...(ps[pIdx].paragraphs || []),
                                "",
                              ];
                              setFormData({ ...formData, passages: ps });
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                          >
                            + Add Paragraph
                          </button>
                        </div>

                        {(passage.paragraphs || []).map((para, paraIdx) => (
                          <div
                            key={paraIdx}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-700">
                                Paragraph {String.fromCharCode(65 + paraIdx)}
                              </span>
                              <button
                                onClick={() => {
                                  if (!formData) return;
                                  const ps = [...formData.passages];
                                  ps[pIdx].paragraphs?.splice(paraIdx, 1);
                                  setFormData({ ...formData, passages: ps });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <textarea
                              className="w-full px-3 py-2 border rounded-lg h-32 font-mono text-sm"
                              placeholder={`Enter paragraph ${String.fromCharCode(65 + paraIdx)} content...`}
                              value={para || ""}
                              onChange={(e) => {
                                if (!formData) return;
                                const ps = [...formData.passages];
                                if (ps[pIdx].paragraphs) {
                                  ps[pIdx].paragraphs[paraIdx] = e.target.value;
                                  setFormData({ ...formData, passages: ps });
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full px-4 py-2 border rounded-lg h-40 font-mono text-sm"
                        placeholder="Passage Content..."
                        value={passage.content}
                        onChange={(e) =>
                          updatePassage(pIdx, "content", e.target.value)
                        }
                      />
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold">Question Groups</h4>
                        <button
                          onClick={() => addGroup(pIdx)}
                          className="flex gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          <Plus size={16} /> Add Group
                        </button>
                      </div>

                      {passage.questionGroups.map((group, gIdx) => (
                        <div
                          key={group.id}
                          className="border rounded-lg bg-gray-50 overflow-hidden"
                        >
                          <div
                            className="p-3 bg-gray-100 flex justify-between cursor-pointer border-b"
                            onClick={() =>
                              setExpandedGroup(
                                expandedGroup === group.id ? null : group.id,
                              )
                            }
                          >
                            <div className="flex gap-3">
                              <span className="bg-blue-600 text-white px-2 rounded font-bold">
                                {group.count}Q
                              </span>
                              <span className="font-bold uppercase text-sm mt-0.5">
                                {group.type.replace(/-/g, " ")}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGroup(pIdx, gIdx);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                              <ChevronDown />
                            </div>
                          </div>

                          {expandedGroup === group.id && (
                            <div className="p-4 space-y-4 bg-white">
                              <div className="grid grid-cols-2 gap-4">
                                <select
                                  className="border p-2 rounded-lg"
                                  value={group.type}
                                  onChange={(e) =>
                                    updateGroupField(
                                      pIdx,
                                      gIdx,
                                      "type",
                                      e.target.value,
                                    )
                                  }
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
                                  className="border p-2 rounded-lg"
                                  value={group.count}
                                  onChange={(e) =>
                                    updateGroupField(
                                      pIdx,
                                      gIdx,
                                      "count",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="relative">
                                <label className="text-xs font-bold text-gray-500 flex gap-1 mb-1">
                                  <Info size={12} /> Instruction
                                </label>
                                <div className="relative">
                                  <select
                                    className="w-full border p-2 rounded-lg appearance-none"
                                    onChange={(e) =>
                                      updateGroupField(
                                        pIdx,
                                        gIdx,
                                        "instruction",
                                        e.target.value,
                                      )
                                    }
                                    value={
                                      COMMON_INSTRUCTIONS.includes(
                                        group.instruction,
                                      )
                                        ? group.instruction
                                        : ""
                                    }
                                  >
                                    <option value="">-- Custom --</option>
                                    {COMMON_INSTRUCTIONS.map((i, k) => (
                                      <option key={k} value={i}>
                                        {i}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <input
                                  className="w-full border p-2 rounded-lg mt-1"
                                  placeholder="Custom instruction..."
                                  value={group.instruction || ""}
                                  onChange={(e) =>
                                    updateGroupField(
                                      pIdx,
                                      gIdx,
                                      "instruction",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              {/* --- SHARED OPTIONS (List of...) --- */}
                              {(group.type === "matching-headings" ||
                                group.type === "matching-headings-drag-drop" ||
                                group.type === "matching-sentence-endings" ||
                                group.type === "matching-features" ||
                                group.type === "summary-completion-box") && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                  <label className="text-xs font-bold text-orange-700 uppercase mb-2 flex gap-2 items-center">
                                    <List size={14} />
                                    {group.type ===
                                    "matching-headings-drag-drop"
                                      ? "Headings List (Draggable)"
                                      : "Common Options List (Shared for Group)"}
                                  </label>
                                  <div className="space-y-2">
                                    {group.sharedOptions?.map((opt, oIdx) => (
                                      <div
                                        key={oIdx}
                                        className="flex gap-2 items-center"
                                      >
                                        <span className="font-bold text-orange-400 w-6 text-right">
                                          {group.type === "matching-headings" ||
                                          group.type ===
                                            "matching-headings-drag-drop"
                                            ? [
                                                "i",
                                                "ii",
                                                "iii",
                                                "iv",
                                                "v",
                                                "vi",
                                                "vii",
                                                "viii",
                                                "ix",
                                                "x",
                                              ][oIdx]
                                            : String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <input
                                          className="flex-1 border border-orange-200 p-2 rounded bg-white"
                                          placeholder={`Option text...`}
                                          value={opt}
                                          onChange={(e) =>
                                            updateSharedOption(
                                              pIdx,
                                              gIdx,
                                              oIdx,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <button
                                          onClick={() =>
                                            removeSharedOption(pIdx, gIdx, oIdx)
                                          }
                                          className="text-red-400 p-1"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() =>
                                        addSharedOption(pIdx, gIdx)
                                      }
                                      className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mt-1 pl-8"
                                    >
                                      + Add Item
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3 pt-2">
                                {group.questions.map((q, qIdx) => (
                                  <div
                                    key={qIdx}
                                    className="p-3 border rounded-lg bg-gray-50/50"
                                  >
                                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded mb-2 inline-block">
                                      #{qIdx + 1}
                                    </span>

                                    {/* CONTEXT TEXT (TEXTAREA) */}
                                    <div className="mb-2">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                        Context Text
                                      </label>
                                      <p className="text-[9px] text-blue-600 mb-1">
                                        💡 **bold**, *italic*, __underline__, 1r
                                        2r 3r (margin)
                                      </p>
                                      <textarea
                                        className="w-full border p-2 rounded text-xs bg-white h-20 font-mono"
                                        placeholder="Use **bold** for emphasis, 1r for indent..."
                                        value={q.contextText || ""}
                                        onChange={(e) =>
                                          updateQuestion(
                                            pIdx,
                                            gIdx,
                                            qIdx,
                                            "contextText",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>

                                    {/* QUESTION TEXT */}
                                    <div className="mb-2">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                        Question / Statement
                                      </label>
                                      <p className="text-[9px] text-blue-600 mb-1">
                                        💡 **bold**, *italic*, __underline__, 1r
                                        2r 3r (margin)
                                      </p>
                                      <textarea
                                        className="w-full border p-2 rounded mb-2 h-16 font-mono text-sm"
                                        placeholder="Use **bold** for emphasis, 1r for indent..."
                                        value={q.question}
                                        onChange={(e) =>
                                          updateQuestion(
                                            pIdx,
                                            gIdx,
                                            qIdx,
                                            "question",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>

                                    {/* INDIVIDUAL OPTIONS (ONLY IF NOT SHARED) */}
                                    {(group.type === "multiple-choice" ||
                                      group.type === "matching") && (
                                      <div className="pl-4 mb-2 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                          Options
                                        </label>
                                        {q.options?.map((opt, oIdx) => (
                                          <div
                                            key={oIdx}
                                            className="flex gap-1 items-center"
                                          >
                                            <span className="text-xs font-bold w-4">
                                              {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <input
                                              className="flex-1 border p-1 rounded text-sm"
                                              value={opt}
                                              onChange={(e) =>
                                                updateOption(
                                                  pIdx,
                                                  gIdx,
                                                  qIdx,
                                                  oIdx,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                            <button
                                              onClick={() =>
                                                removeOption(
                                                  pIdx,
                                                  gIdx,
                                                  qIdx,
                                                  oIdx,
                                                )
                                              }
                                              className="text-red-400 p-1"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() =>
                                            addOption(pIdx, gIdx, qIdx)
                                          }
                                          className="text-xs text-blue-500 font-bold hover:underline"
                                        >
                                          + Add Option
                                        </button>
                                      </div>
                                    )}

                                    {/* ANSWER */}
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                                        Answer
                                      </label>
                                      <input
                                        className="w-full border p-2 rounded bg-green-50"
                                        placeholder="Correct Answer"
                                        value={q.correctAnswer}
                                        onChange={(e) =>
                                          updateQuestion(
                                            pIdx,
                                            gIdx,
                                            qIdx,
                                            "correctAnswer",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border rounded-lg font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
