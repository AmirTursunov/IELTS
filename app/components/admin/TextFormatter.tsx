"use client";
import React from "react";

/**
 * Text Formatter Component - TypeScript version
 *
 * Syntax:
 * **bold** → <strong>bold</strong>
 * *italic* → <em>italic</em>
 * __underline__ → <u>underline</u>
 * ***bold italic*** → <strong><em>bold italic</em></strong>
 */

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

export const TextFormatter: React.FC<TextFormatterProps> = ({
  text,
  className = "",
}) => {
  if (!text) return null;

  const allMatches: Match[] = [];

  // Bold-italic (***...***) - process first to avoid conflicts
  const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
  let match: RegExpExecArray | null;

  while ((match = boldItalicRegex.exec(text)) !== null) {
    allMatches.push({
      type: "bold-italic",
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  // Bold (**...**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  while ((match = boldRegex.exec(text)) !== null) {
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

  // Italic (*...*)
  const italicRegex = /\*(.*?)\*/g;
  while ((match = italicRegex.exec(text)) !== null) {
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

  // Underline (__...__)
  const underlineRegex = /__(.*?)__/g;
  while ((match = underlineRegex.exec(text)) !== null) {
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

  // Sort by position
  allMatches.sort((a, b) => a.start - b.start);

  // Build result
  let currentIndex = 0;
  const result: React.ReactNode[] = [];

  allMatches.forEach((m, idx) => {
    // Add text before match
    if (m.start > currentIndex) {
      result.push(
        <React.Fragment key={`text-${currentIndex}`}>
          {text.slice(currentIndex, m.start)}
        </React.Fragment>,
      );
    }

    // Add formatted text
    switch (m.type) {
      case "bold":
        result.push(<strong key={`match-${idx}`}>{m.text}</strong>);
        break;
      case "italic":
        result.push(<em key={`match-${idx}`}>{m.text}</em>);
        break;
      case "underline":
        result.push(<u key={`match-${idx}`}>{m.text}</u>);
        break;
      case "bold-italic":
        result.push(
          <strong key={`match-${idx}`}>
            <em>{m.text}</em>
          </strong>,
        );
        break;
    }

    currentIndex = m.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    result.push(
      <React.Fragment key={`text-${currentIndex}`}>
        {text.slice(currentIndex)}
      </React.Fragment>,
    );
  }

  return <span className={className}>{result}</span>;
};

export default TextFormatter;
