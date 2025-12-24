// app/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to send reset email");
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-linear-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -ml-36 -mb-36"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/50 text-center">
            <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Check Your Email! 📧
            </h1>

            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong>
                <br />
                Check your spam folder or wait a few minutes.
              </p>
            </div>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-linear-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -ml-36 -mb-36"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/50">
          {/* Header */}
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-4 group"
            >
              <div className="bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-xl font-black text-xl text-white shadow-lg group-hover:scale-105 transition-transform">
                IELTS
              </div>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Forgot Password? 🔒
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset
              instructions.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white/50"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
