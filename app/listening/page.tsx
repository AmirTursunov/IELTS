// app/listening/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Headphones,
  Clock,
  ArrowRight,
  Filter,
  Loader2,
  Award,
  Volume2,
  User,
} from "lucide-react";

const API_BASE = "/api";

interface ListeningTest {
  _id: string;
  testName?: string;
  title?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  totalQuestions: number;
  sections?: any[];
}

export default function ListeningTestsPage() {
  const { data: session, status } = useSession();
  const [listeningTests, setListeningTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Academic" | "General">("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listening`);
      const result = await response.json();
      if (result.success) setListeningTests(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (id: string) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    router.push(`/listening/${id}?part=0`);
  };

  const filtered =
    filter === "all"
      ? listeningTests
      : listeningTests.filter((t) => t.testType === filter);

  const difficultyColor = (d: string) => {
    if (d === "Easy") return "bg-green-100 text-green-700 border-green-300";
    if (d === "Medium")
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (d === "Hard") return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-700";
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2FF]">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-[#9C74FF] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2FF]">
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-[#9C74FF]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#9C74FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-[#9C74FF]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please sign in to start the test
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 border rounded-xl py-3"
                >
                  Cancel
                </button>
                <Link
                  href="/sign-in"
                  className="flex-1 text-center py-3 rounded-xl text-white font-semibold bg-[#9C74FF]"
                >
                  Sign In
                </Link>
              </div>

              <Link
                href="/sign-up"
                className="block mt-3 text-sm text-[#9C74FF]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow mb-6 border border-[#9C74FF]">
            <Award className="text-[#9C74FF]" />
            <span className="font-semibold text-[#9C74FF]">
              Official IELTS Practice
            </span>
          </div>

          <h2 className="text-5xl font-bold text-[#9C74FF] mb-4">
            IELTS Listening Tests
          </h2>
          <p className="text-xl text-gray-600">
            Improve your listening skills with real practice tests
          </p>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-xl shadow p-5 mb-8 flex gap-3 items-center">
          <Filter className="text-[#9C74FF]" />
          {["all", "Academic", "General"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2 rounded-lg font-semibold ${
                filter === f ? "bg-[#9C74FF] text-white" : "bg-gray-100"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((test) => (
            <div
              key={test._id}
              className="bg-white rounded-2xl shadow hover:shadow-xl"
            >
              {/* HEADER */}
              <div className="bg-[#9C74FF] text-white p-6 rounded-t-2xl">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold">
                    {test.testName || test.title || "Listening Test"}
                  </h3>
                  <Headphones />
                </div>

                <div className="flex gap-2 mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColor(
                      test.difficulty
                    )}`}
                  >
                    {test.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                    {test.testType}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-3">
                <Info
                  label="Time"
                  value={`${test.timeLimit} min`}
                  icon={<Clock />}
                />
                <Info label="Questions" value={test.totalQuestions} />
                <Info
                  label="Sections"
                  value={test.sections?.length || 4}
                  icon={<Volume2 />}
                />

                <button
                  onClick={() => startTest(test._id)}
                  className="w-full bg-[#9C74FF] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  Start Test <ArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* SMALL COMPONENT */
function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: any;
}) {
  return (
    <div className="flex justify-between items-center bg-[#F5F2FF] p-3 rounded-lg">
      <span className="flex gap-2 items-center text-gray-700 text-sm">
        {icon} {label}
      </span>
      <span className="font-bold text-[#9C74FF]">{value}</span>
    </div>
  );
}
