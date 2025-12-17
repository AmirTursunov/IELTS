// components/Navbar.tsx - Practice Tests Dropdown Menu
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Clock,
  User,
  LogOut,
  LucideHome,
  ChevronDown,
  BookMarked,
  GraduationCap,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPracticeMenu, setShowPracticeMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);

  const practiceTests = [
    {
      name: "Listening",
      href: "/listening",
      icon: Headphones,
      available: true,
      color: "from-cyan-500 to-blue-500",
      description: "Audio-based comprehension",
    },
    {
      name: "Reading",
      href: "/reading",
      icon: BookOpen,
      available: true,
      color: "from-purple-500 to-pink-500",
      description: "Text comprehension tests",
    },
    {
      name: "Writing",
      href: "/writing",
      icon: PenTool,
      available: false,
      color: "from-orange-500 to-red-500",
      description: "Essay & task writing",
    },
    {
      name: "Speaking",
      href: "/speaking",
      icon: MessageSquare,
      available: false,
      color: "from-green-500 to-teal-500",
      description: "Oral communication",
    },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        practiceMenuRef.current &&
        !practiceMenuRef.current.contains(event.target as Node)
      ) {
        setShowPracticeMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Home Link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors group"
            >
              <LucideHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>

            {/* Practice Tests Dropdown */}
            <div className="relative" ref={practiceMenuRef}>
              <button
                onClick={() => setShowPracticeMenu(!showPracticeMenu)}
                onMouseEnter={() => setShowPracticeMenu(true)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors group"
              >
                <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Practice Tests</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showPracticeMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showPracticeMenu && (
                <div
                  onMouseLeave={() => setShowPracticeMenu(false)}
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Choose Your Test
                    </p>
                  </div>

                  {practiceTests.map((test) => (
                    <div key={test.name}>
                      {test.available ? (
                        <Link
                          href={test.href}
                          onClick={() => setShowPracticeMenu(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-linear-to-r hover:from-purple-50 hover:to-blue-50 transition-all group"
                        >
                          <div
                            className={`p-2.5 bg-linear-to-br ${test.color} rounded-xl group-hover:scale-110 transition-transform shadow-md`}
                          >
                            <test.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 group-hover:text-[#9C74FF] transition-colors">
                                {test.name}
                              </h4>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {test.description}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="px-4 py-3 opacity-60 cursor-not-allowed hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 bg-linear-to-br ${test.color} rounded-xl opacity-50`}
                            >
                              <test.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-500">
                                  {test.name}
                                </h4>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-700">
                                    Soon
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {test.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Footer Info */}
                  <div className="px-4 py-3 mt-2 border-t border-gray-100 bg-linear-to-r from-blue-50 to-purple-50 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Sparkles className="w-4 h-4 text-[#9C74FF]" />
                      <span className="font-semibold">
                        All tests follow official IELTS format
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Blog Link */}
            <Link
              href="/blog"
              className="flex items-center gap-2 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors group"
            >
              <BookMarked className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Blog</span>
            </Link>
          </div>

          {/* Right Side - Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {status === "loading" ? (
              <div className="w-8 h-8 border-2 border-[#9C74FF] border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full border-2 border-cyan-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-cyan-500 to-[#9C74FF] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-gray-800">
                    {session.user.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="font-bold text-gray-900 truncate">
                        {session.user.email}
                      </p>
                      {session.user.role === "admin" && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        My Dashboard
                      </span>
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-purple-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="font-semibold">Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-200 mt-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-6 py-2.5 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2.5 bg-[#9C74FF] text-white rounded-xl font-bold hover:bg-[#8B5FE8] transition-all shadow-lg"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors py-2"
              >
                <LucideHome className="w-5 h-5" />
                <span>Home</span>
              </Link>

              {/* Practice Tests Section */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 px-2">
                  Practice Tests
                </p>
                {practiceTests.map((test) => (
                  <div key={test.name}>
                    {test.available ? (
                      <Link
                        href={test.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 px-2 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <div
                          className={`p-2 bg-linear-to-br ${test.color} rounded-lg`}
                        >
                          <test.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">
                              {test.name}
                            </p>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <p className="text-xs text-gray-600">
                            {test.description}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 py-2 px-2 opacity-60">
                        <div
                          className={`p-2 bg-linear-to-br ${test.color} rounded-lg opacity-50`}
                        >
                          <test.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-500">
                              {test.name}
                            </p>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
                              <Clock className="w-3 h-3 text-yellow-600" />
                              <span className="text-xs font-bold text-yellow-700">
                                Coming Soon
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {test.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Blog */}
              <div className="border-t border-gray-200 pt-4">
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#9C74FF] font-bold transition-colors py-2"
                >
                  <BookMarked className="w-5 h-5" />
                  <span>Blog</span>
                </Link>
              </div>

              {/* Mobile Auth Section */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                {status === "loading" ? (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-2 border-[#9C74FF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : session ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-10 h-10 rounded-full border-2 border-cyan-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-cyan-500 to-[#9C74FF] flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      {session.user.role === "admin" && (
                        <span className="inline-block px-2 py-0.5 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
                    >
                      <User className="w-5 h-5" />
                      My Dashboard
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-2.5 text-center text-gray-700 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-2.5 text-center bg-linear-to-r from-cyan-500 to-[#9C74FF] text-white rounded-xl font-bold shadow-lg"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
