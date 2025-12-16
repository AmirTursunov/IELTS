"use client";
import { useState } from "react";
import ExamModal from "./useDemoModal";

export default function UseDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="px-8 py-4 bg-[#55BE9D] text-white rounded-xl font-bold text-lg hover:bg-[#48A88A] transition-all shadow-xl"
        onClick={() => setIsModalOpen(true)}
      >
        Use Demo
      </button>

      {isModalOpen && <ExamModal setIsOpen={setIsModalOpen} />}
    </>
  );
}
