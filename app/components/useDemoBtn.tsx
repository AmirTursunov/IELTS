"use client";
import { useState } from "react";
import ExamModal from "./useDemoModal";

export default function UseDemoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="
  bg-[#00C853]
  hover:bg-[#00B44A]
  text-black
  px-9 py-4
  rounded-xl
  font-black
  text-lg
  shadow-[0_14px_35px_rgba(0,200,83,0.45)]
  transition-all
  duration-300
  hover:-translate-y-0.5
  hover:shadow-[0_20px_45px_rgba(0,200,83,0.6)]
"
        onClick={() => setIsModalOpen(true)}
      >
        Use Demo
      </button>

      {isModalOpen && <ExamModal setIsOpen={setIsModalOpen} />}
    </>
  );
}
