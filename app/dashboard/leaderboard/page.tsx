// app/leaderboard/page.tsx - TOP 10 ONLY
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Loader2,
  Crown,
  Star,
  Zap,
  Target,
  BookOpen,
  Headphones,
  ChevronLeft,
  Users,
} from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avgBand: number;
  totalTests: number;
  lastTestDate: string;
  bestReading: number;
  bestListening: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [session]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data.leaderboard);

        // Find current user's rank
        if (session?.user?.email) {
          const rank = data.data.leaderboard.findIndex(
            (u: LeaderboardUser) => u.email === session.user.email
          );
          if (rank !== -1) {
            setUserRank(rank + 1);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C74FF] mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Rankings Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Be the first to complete 3 tests and appear on the leaderboard!
          </p>
          <Link
            href="/listening"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#9C74FF] text-white rounded-lg font-semibold hover:bg-[#8B5FE8] transition-all"
          >
            Take a Test
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-violet-50 to-purple-100">
      {/* Header */}
      <div className="bg-[#9C74FF] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3">
                <Trophy className="w-10 h-10" />
                Leaderboard
              </h1>
              <p className="text-purple-100 mt-2">
                Top 10 performers ranked by average band score
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Total Competitors</p>
                  <p className="text-2xl font-black">{leaderboard.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Top Score</p>
                  <p className="text-2xl font-black">
                    {leaderboard[0]?.avgBand || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Your Rank</p>
                  <p className="text-2xl font-black">
                    {userRank ? `#${userRank}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-purple-100 border-2 border-[#9C74FF]/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#9C74FF] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 mb-1">How Rankings Work</p>
              <p className="text-sm text-gray-700">
                Users are ranked by <strong>Average Band Score</strong> (minimum
                3 tests required). Tie-breakers: Total Tests, then Most Recent
                Test. <strong>Top 10 users only.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="col-start-1 mt-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-300 hover:shadow-2xl transition-all">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-gray-300 to-gray-500 rounded-full mb-4 shadow-lg">
                    <Medal className="w-8 h-8 text-white fill-white" />
                  </div>
                  {leaderboard[1].avatar ? (
                    <img
                      src={leaderboard[1].avatar}
                      alt={leaderboard[1].name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-linear-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-300">
                      {leaderboard[1].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-black text-lg text-gray-900 mb-1">
                    {leaderboard[1].name}
                  </h3>
                  <div className="text-3xl font-black text-[#9C74FF] mb-2">
                    {leaderboard[1].avgBand}
                  </div>
                  <p className="text-sm text-gray-600">
                    {leaderboard[1].totalTests} tests
                  </p>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="col-start-2">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-yellow-400 hover:shadow-3xl transition-all relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="bg-linear-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg">
                    🏆 CHAMPION
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full mb-4 shadow-xl">
                    <Crown className="w-10 h-10 text-white fill-white" />
                  </div>
                  {leaderboard[0].avatar ? (
                    <img
                      src={leaderboard[0].avatar}
                      alt={leaderboard[0].name}
                      className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-yellow-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-yellow-400">
                      {leaderboard[0].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-black text-xl text-gray-900 mb-1">
                    {leaderboard[0].name}
                  </h3>
                  <div className="text-4xl font-black text-[#9C74FF] mb-2">
                    {leaderboard[0].avgBand}
                  </div>
                  <p className="text-sm text-gray-600">
                    {leaderboard[0].totalTests} tests
                  </p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="col-start-3 mt-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-500 hover:shadow-2xl transition-all">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-amber-400 to-amber-600 rounded-full mb-4 shadow-lg">
                    <Medal className="w-8 h-8 text-white fill-white" />
                  </div>
                  {leaderboard[2].avatar ? (
                    <img
                      src={leaderboard[2].avatar}
                      alt={leaderboard[2].name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-amber-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-amber-500">
                      {leaderboard[2].name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-black text-lg text-gray-900 mb-1">
                    {leaderboard[2].name}
                  </h3>
                  <div className="text-3xl font-black text-[#9C74FF] mb-2">
                    {leaderboard[2].avgBand}
                  </div>
                  <p className="text-sm text-gray-600">
                    {leaderboard[2].totalTests} tests
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of Rankings (4-10) - TOP 10 ONLY */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="bg-linear-to-r from-[#9C74FF] to-purple-600 px-6 py-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6" />
              Top 10 Rankings
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {/* ✅ SHOW ONLY POSITIONS 4-10 (slice(3, 10)) */}
            {leaderboard.slice(3, 10).map((user, index) => {
              const rank = index + 4;
              const isCurrentUser = user.email === session?.user?.email;

              return (
                <div
                  key={`${rank}-${user.email}-${user._id}`}
                  className={`p-6 hover:bg-purple-50 transition-all ${
                    isCurrentUser
                      ? "bg-purple-50 border-l-4 border-[#9C74FF]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="w-12 text-center">
                      <span className="text-2xl font-black text-gray-600">
                        #{rank}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#9C74FF] to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-gray-900 mb-1">
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-[#9C74FF] text-white px-2 py-1 rounded-full">
                            YOU
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {user.totalTests} tests
                        </span>
                        {user.bestReading > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Reading: {user.bestReading}
                          </span>
                        )}
                        {user.bestListening > 0 && (
                          <span className="flex items-center gap-1">
                            <Headphones className="w-4 h-4" />
                            Listening: {user.bestListening}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Average Band */}
                    <div className="text-right">
                      <div className="text-4xl font-black text-[#9C74FF]">
                        {user.avgBand}
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">
                        Average Band
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Not on Leaderboard Message */}
        {session && !userRank && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-yellow-600 shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Keep Practicing! 💪
                </h3>
                <p className="text-gray-700 mb-3">
                  You need at least <strong>3 completed tests</strong> to appear
                  on the leaderboard. Keep taking tests to see your ranking!
                </p>
                <Link
                  href="/listening"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C74FF] text-white rounded-lg font-semibold hover:bg-[#8B5FE8] transition-all"
                >
                  Take a Test
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* User Outside Top 10 Message */}
        {session && userRank && userRank > 10 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  You're Ranked #{userRank}! 🎯
                </h3>
                <p className="text-gray-700 mb-3">
                  Keep practicing to break into the <strong>Top 10</strong>!
                  Your current average band score:{" "}
                  <strong>
                    {
                      leaderboard.find((u) => u.email === session?.user?.email)
                        ?.avgBand
                    }
                  </strong>
                </p>
                <Link
                  href="/listening"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C74FF] text-white rounded-lg font-semibold hover:bg-[#8B5FE8] transition-all"
                >
                  Practice More
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
