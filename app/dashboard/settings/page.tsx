// app/dashboard/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Moon,
  Save,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: true,
    darkMode: false,
    language: "en",
  });

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setFetchingProfile(true);
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (data.success) {
        setFormData({
          name: data.data.name || "",
          email: data.data.email || "",
          notifications: true,
          darkMode: false,
          language: "en",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const [loadingName, setLoadingName] = useState(false);
  const [successName, setSuccessName] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Update session with new name
        await update({ name: formData.name });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    setError("");
    setLoadingName(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessName(true);
        // Update session with new name
        await update({ name: formData.name });
        setTimeout(() => setSuccessName(false), 3000);
      } else {
        setError(data.error || "Failed to update name");
      }
    } catch (error) {
      console.error("Update name error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoadingName(false);
    }
  };

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const handleRequestPasswordChange = async () => {
    setError("");
    setLoading(true);

    try {
      // Send notification email
      const response = await fetch(
        "/api/user/send-password-change-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.success) {
        setShowPasswordChangeModal(true);
      } else {
        setError(data.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Request error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToChangePassword = () => {
    setShowPasswordChangeModal(false);
    router.push("/dashboard/change-password");
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Password Change Success Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-white/50 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Check Your Email! 📧
            </h2>

            <p className="text-gray-600 mb-6">
              We've sent a password change notification to{" "}
              <strong>{formData.email}</strong>
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Ready to change your password?</strong>
                <br />
                Click the button below to proceed securely.
              </p>
            </div>

            {/* <button
              onClick={handleGoToChangePassword}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg mb-3"
            >
              Change Password Now
            </button> */}

            <button
              onClick={() => setShowPasswordChangeModal(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b-2 border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">
                Manage your account preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successName && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </div>
            <p className="text-green-700 font-semibold">
              Name updated successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">!</span>
            </div>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg">
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 shadow-lg">
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Security
            </h2>

            <button
              onClick={handleRequestPasswordChange}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all group disabled:opacity-50 border-2 border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">
                    Update your password securely
                  </p>
                </div>
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveName}
            disabled={loadingName}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {loadingName ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
