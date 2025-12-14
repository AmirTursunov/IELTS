// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Clock,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navLinks = [
    {
      name: "Listening",
      href: "/listening",
      icon: Headphones,
      available: true,
    },
    { name: "Reading", href: "/reading", icon: BookOpen, available: true },
    { name: "Writing", href: "/writing", icon: PenTool, available: false },
    {
      name: "Speaking",
      href: "/speaking",
      icon: MessageSquare,
      available: false,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-2.5 rounded-xl font-black text-2xl text-white shadow-lg group-hover:scale-105 transition-transform">
              IELTS
            </div>
            <span className="text-xl font-black text-gray-800 hidden md:block">
              Mock Exam
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => setHoveredItem(link.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {link.available ? (
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-bold transition-colors group"
                  >
                    {link.icon && (
                      <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{link.name}</span>
                  </Link>
                ) : (
                  <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-bold transition-colors group cursor-not-allowed">
                    {link.icon && (
                      <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{link.name}</span>
                  </button>
                )}

                {/* Coming Soon Dropdown */}
                {!link.available && hoveredItem === link.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <div className="bg-linear-to-br from-yellow-400 to-orange-400 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          Coming Soon!
                        </h4>
                        <p className="text-sm text-gray-600">
                          We're working hard to bring you {link.name} practice
                          tests. Stay tuned!
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold">
                        🚀 Expected launch: Q1 2025
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 text-gray-700 hover:text-blue-600 font-bold transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Sign Up Free
            </Link>
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
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.available ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-bold transition-colors py-2"
                    >
                      {link.icon && <link.icon className="w-5 h-5" />}
                      <span>{link.name}</span>
                    </Link>
                  ) : (
                    <div className="py-2">
                      <div className="flex items-center gap-2 text-gray-400 font-bold mb-2">
                        {link.icon && <link.icon className="w-5 h-5" />}
                        <span>{link.name}</span>
                      </div>
                      <div className="ml-7 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-800">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700">
                          Expected launch: Q1 2025
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2.5 text-center text-gray-700 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2.5 text-center bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
