import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="bg-[#9C74FF] px-5 py-2.5 rounded-xl font-black text-2xl text-white shadow-lg group-hover:scale-105 transition-transform">
        IELTS
      </div>
      <span className="text-xl font-black text-gray-800 hidden md:block">
        Mock Exam
      </span>
    </Link>
  );
}
