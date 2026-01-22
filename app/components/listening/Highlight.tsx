"use client";

import React from "react";
import { Highlighter, Plus } from "lucide-react";

interface HighlightMenuProps {
  x: number;
  y: number;
  onHighlight: (color: string, withNote: boolean) => void;
  onClose: () => void;
}

export function HighlightMenu({
  x,
  y,
  onHighlight,
  onClose,
}: HighlightMenuProps) {
  return (
    <div
      className="fixed bg-white shadow-xl rounded-lg p-2 flex gap-2 z-50 border-2 border-purple-200"
      style={{
        top: `${y}px`,
        left: `${x}px`,
        transform: "translate(-50%, -100%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Yellow highlight */}
      <button
        onClick={() => onHighlight("yellow", true)}
        className="p-2 hover:bg-yellow-50 rounded transition-colors"
        title="Yellow highlight"
      >
        <Highlighter size={18} className="text-yellow-500" />
      </button>

      {/* Green highlight */}
      <button
        onClick={() => onHighlight("green", true)}
        className="p-2 hover:bg-green-50 rounded transition-colors"
        title="Green highlight"
      >
        <Highlighter size={18} className="text-green-500" />
      </button>

      {/* Add note */}
      <button
        onClick={() => onHighlight("yellow", true)}
        className="p-2 hover:bg-purple-50 rounded transition-colors"
        title="Add note"
      >
        <Plus size={18} className="text-purple-500" />
      </button>
    </div>
  );
}
