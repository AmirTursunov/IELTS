// app/reset-password/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Resetting password with token:",
        token?.substring(0, 10) + "..."
      );

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      console.log("Response status:", response.status);

      const text = await response.text();
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        setError("Server returned invalid response");
        setLoading(false);
        return;
      }

      console.log("Response data:", data);

      if (!data.success) {
        setError(data.error || data.details || "Failed to reset password");
      } else {
        setSuccess(true);
        console.log(
          "✅ Password reset successful! Redirecting in 3 seconds..."
        );
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Request error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-linear-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl -ml-36 -mb-36"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/50 text-center">
            <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Password Reset Successful! ✨
            </h1>

            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. Redirecting to sign
              in...
            </p>

            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
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
              Reset Password 🔐
            </h1>
            <p className="text-gray-600">Enter your new password below</p>
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
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800">
                <strong>Password requirements:</strong>
                <br />• At least 6 characters long
                <br />• Use a strong, unique password
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
