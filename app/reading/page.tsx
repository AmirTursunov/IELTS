// app/reading/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Filter,
  Loader2,
  Award,
  User,
} from "lucide-react";

const API_BASE = "/api";

interface Test {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  testType: "Academic" | "General";
  totalQuestions: number;
  passages?: any[];
}

export default function ReadingTestsPage() {
  const { data: session, status } = useSession();
  const [readingTests, setReadingTests] = useState<Test[]>([]);
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
      const response = await fetch(`${API_BASE}/reading`);
      const result = await response.json();

      if (result.success) {
        setReadingTests(result.data);
      }
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (testId: string) => {
    // Check authentication
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!testId || testId === "undefined") {
      alert("Invalid test ID");
      return;
    }
    router.push(`/reading/${testId}?part=0`);
  };

  const filteredReading =
    filter === "all"
      ? readingTests
      : readingTests.filter((t) => t.testType === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-cyan-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-6">
                You need to sign in or create an account to take this test.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Link
                  href="/sign-in"
                  className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-md text-center"
                >
                  Sign In
                </Link>
              </div>
              <Link
                href="/sign-up"
                className="block mt-3 text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md mb-6 border border-cyan-200">
            <Award className="text-cyan-600" size={24} />
            <span className="font-semibold text-cyan-900">
              Official IELTS Practice
            </span>
          </div>
          <h2 className="text-5xl font-bold bg-linear-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4">
            Practice IELTS Reading Tests
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prepare for your IELTS exam with authentic practice tests designed
            by experts
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-8 flex items-center gap-4 border border-cyan-100">
          <div className="flex items-center gap-2 text-cyan-600">
            <Filter size={20} />
            <span className="font-semibold text-gray-700">Filter:</span>
          </div>
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              filter === "all"
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Tests
          </button>
          <button
            onClick={() => setFilter("Academic")}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              filter === "Academic"
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setFilter("General")}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              filter === "General"
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            General Training
          </button>
        </div>

        {/* Stats */}
        {filteredReading.length > 0 && (
          <div className="mt-10 mb-10 bg-white rounded-xl shadow-md p-5 border border-cyan-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <div className="text-2xl font-bold text-cyan-600 mb-1">
                  {filteredReading.length}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  Available Tests
                </div>
              </div>

              <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {filteredReading.reduce(
                    (acc, test) => acc + (test.passages?.length || 3),
                    0
                  )}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  Total Passages
                </div>
              </div>

              <div className="p-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {filteredReading.reduce(
                    (acc, test) => acc + test.totalQuestions,
                    0
                  )}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  Total Questions
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tests Grid */}
        {filteredReading.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-cyan-100">
            <div className="bg-linear-to-br from-cyan-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} className="text-cyan-600" />
            </div>
            <p className="text-gray-700 text-xl mb-2 font-semibold">
              No tests available
            </p>
            <p className="text-gray-500">
              Tests will appear here once they are created
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReading.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-cyan-100 hover:border-cyan-300 group"
              >
                {/* Test Header */}
                <div className="bg-linear-to-r from-cyan-500 to-blue-600 text-white p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold leading-tight pr-2">
                        {test.title}
                      </h3>
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <BookOpen size={24} className="shrink-0" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(
                          test.difficulty
                        )}`}
                      >
                        {test.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border-2 border-white/30">
                        {test.testType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-linear-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                    <span className="text-gray-700 flex items-center gap-2 font-medium text-sm">
                      <Clock size={18} className="text-cyan-600" />
                      Time Limit
                    </span>
                    <span className="font-bold text-cyan-700">
                      {test.timeLimit} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <span className="text-gray-700 font-medium text-sm">
                      Questions
                    </span>
                    <span className="font-bold text-blue-700">
                      {test.totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <span className="text-gray-700 font-medium text-sm">
                      Passages
                    </span>
                    <span className="font-bold text-indigo-700">
                      {test.passages?.length || 3}
                    </span>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => startTest(test._id)}
                      className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg group-hover:shadow-xl transform group-hover:scale-[1.02]"
                    >
                      Start Test
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
