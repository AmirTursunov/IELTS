// app/dashboard/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  TrendingUp,
  BookOpen,
  Headphones,
  Mic,
  FileText,
  LogOut,
  Settings,
  Award,
  Target,
  Clock,
  BarChart3,
  ChevronRight,
  Flame,
  Zap,
  RefreshCw,
} from "lucide-react";
import TipOfTheDay from "../components/TipOfTheDay";

interface Stats {
  totalTests: number;
  averageBand: number;
  studyStreak: number;
  hoursStudied: number;
}

interface RecentTest {
  id: string;
  type: string;
  score: number;
  bandScore: number;
  date: string;
}

interface UserData {
  stats: Stats;
  recentTests: RecentTest[];
  performanceByType: {
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
    joinedAt: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load data");
      }
    } catch (err: any) {
      console.error("Dashboard data error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

  const getTestIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "reading":
        return BookOpen;
      case "listening":
        return Headphones;
      case "speaking":
        return Mic;
      case "writing":
        return FileText;
      default:
        return BookOpen;
    }
  };

  const getTestColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "reading":
        return "from-blue-500 to-cyan-500";
      case "listening":
        return "from-purple-500 to-pink-500";
      case "speaking":
        return "from-orange-500 to-red-500";
      case "writing":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  //   const upcomingGoals = [
  //     {
  //       id: 1,
  //       title: "Complete 5 Reading Tests",
  //       progress: Math.min((data.performanceByType.reading / 5) * 100, 100),
  //     },
  //     {
  //       id: 2,
  //       title: "Reach 8.0 Average Band",
  //       progress: data.stats.averageBand >= 8.0 ? 100 : 0,
  //     },
  //     {
  //       id: 3,
  //       title: "Study 30 Days Streak",
  //       progress: Math.min((data.stats.studyStreak / 30) * 100, 100),
  //     },
  //   ];
  //   const tips = [
  //     "Practice speaking for at least 15 minutes daily. Record yourself and listen back to identify areas for improvement! 🎤",
  //     "Read an English article every day and summarize it in your own words. 📰",
  //     "Learn 5 new vocabulary words each day and use them in sentences. ✏️",
  //     "Listen to an English podcast and try shadowing the speaker. 🎧",
  //     "Write a short diary entry in English daily. 📝",
  //     "Practice pronunciation using tongue twisters. 👅",
  //     "Watch a short English video and try to mimic the dialogue. 🎬",
  //     "Review your mistakes from previous tests and focus on weak areas. 📊",
  //     "Join an English speaking club or online group to practice conversation. 🤝",
  //     "Set a small daily goal for reading, writing, listening, or speaking. 🎯",
  //   ];
  //   const today = new Date();
  //   const tipIndex = today.getDate() % tips.length;
  //   const tipOfTheDay = tips[tipIndex];
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };
  console.log(data);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b-2 border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-xl font-black text-xl text-white shadow-lg group-hover:scale-105 transition-transform">
                IELTS
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900">
                  {data.user.name}
                </p>
                <p className="text-xs text-gray-500">{data.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchDashboardData}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => router.push("/dashboard/leaderboard")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Leaderboard"
                >
                  <Trophy className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome back, {data.user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Track your IELTS preparation progress and achieve your goals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {data.stats.totalTests}
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Tests Completed
            </p>
          </div>

          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
            {/* Asosiy kontent */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>

            <p className="text-3xl font-black text-gray-900 mb-1">
              {data.stats.averageBand.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Average Band Score
            </p>

            {/* Hover Overlay */}
            <div
              onClick={() => redirect("/dashboard/leaderboard")}
              className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-bold flex items-center justify-center gap-2 py-3"
            >
              View Leaderboard
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-r from-orange-500 to-red-500 rounded-xl">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {data.stats.studyStreak}
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Days Streak 🔥
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {data.stats.hoursStudied}h
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Total Study Time
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Tests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Recent Tests
                </h2>
                <button
                  onClick={fetchDashboardData}
                  className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group"
                >
                  Refresh
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              {data.recentTests.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold mb-4">
                    No tests completed yet
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    <Zap className="w-5 h-5" />
                    Start Your First Test
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {data.recentTests.map((test, i) => {
                      const Icon = getTestIcon(test.type);
                      const color = getTestColor(test.type);
                      return (
                        <div
                          key={`${test.id}-${i}-${test.date}`}
                          className="flex items-center gap-4 p-4 bg-linear-to-r from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all group cursor-pointer"
                        >
                          <div
                            className={`p-3 bg-linear-to-r ${color} rounded-xl`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors capitalize">
                              {test.type} Test
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(test.date)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">
                              {test.bandScore.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">
                              Band Score
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    href="/tests"
                    className="mt-6 w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-5 h-5" />
                    Start New Test
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Performance by Type */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg">
              <h2 className="text-2xl font-black text-gray-900 mb-4">
                Performance by Type
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data.performanceByType).map(([type, score]) => {
                  const Icon = getTestIcon(type);
                  const color = getTestColor(type);
                  return (
                    <div
                      key={type}
                      className="p-4 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100"
                    >
                      <div
                        className={`inline-flex p-2 bg-linear-to-r ${color} rounded-lg mb-2`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-black text-gray-900">
                        {score > 0 ? score.toFixed(1) : "-"}
                      </p>
                      <p className="text-sm text-gray-600 font-semibold capitalize">
                        {type}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Goals & Quick Links */}
          <div className="space-y-6">
            {/* Study Tips */}
            <TipOfTheDay />
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg">
              <h2 className="text-xl font-black text-gray-900 mb-4">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link
                  href="/reading"
                  className="flex items-center gap-3 p-3 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 text-sm">
                    Reading Practice
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/listening"
                  className="flex items-center gap-3 p-3 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
                >
                  <Headphones className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900 text-sm">
                    Listening Practice
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/speaking"
                  className="flex items-center gap-3 p-3 bg-linear-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all group"
                >
                  <Mic className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-900 text-sm">
                    Speaking Practice
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/writing"
                  className="flex items-center gap-3 p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all group"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900 text-sm">
                    Writing Practice
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
