"use client";
import React, { FC, useEffect, useState } from "react";
import {
  Search,
  Loader2,
  User as UserIcon,
  RefreshCw,
  X,
  Mail,
  Clock,
  Crown,
  Shield,
  CalendarCheck,
} from "lucide-react";

// API dan keladigan ma'lumot formati
interface UserData {
  _id: string;
  name: string;
  email: string;
  tests: number;
  score: string | number;
  status: "free" | "premium" | "vip";
  statusExpiry?: string;
  createdAt: string;
}

export const UsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newStatus, setNewStatus] = useState<"free" | "premium" | "vip">(
    "free",
  );
  const [duration, setDuration] = useState<number>(1);
  const [updating, setUpdating] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [infoUser, setInfoUser] = useState<UserData | null>(null);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInfoModal = (user: UserData) => {
    setInfoUser(user);
    setShowInfoModal(true);
  };

  const handleSendEmail = async () => {
    if (!infoUser) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/users/${infoUser._id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "status" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Email sent successfully!");
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch {
      alert("Error sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenStatusModal = (user: UserData) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setDuration(1);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, duration }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        setShowStatusModal(false);
        alert("Status updated successfully!");
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (
    status: string,
    expiry?: string,
    onClick?: () => void,
  ) => {
    const isExpired = expiry && new Date(expiry) < new Date();
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity select-none";

    if (status === "free" || isExpired) {
      return (
        <span
          onClick={onClick}
          className={`${baseClasses} bg-gray-100 text-gray-700`}
        >
          Free
        </span>
      );
    } else if (status === "premium") {
      return (
        <span
          onClick={onClick}
          className={`${baseClasses} bg-blue-100 text-blue-700 ring-1 ring-blue-200`}
        >
          Premium
        </span>
      );
    } else if (status === "vip") {
      return (
        <span
          onClick={onClick}
          className={`${baseClasses} bg-purple-100 text-purple-700 ring-1 ring-purple-200`}
        >
          VIP
        </span>
      );
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Users</h2>
          <p className="text-gray-600">Manage registered users</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition shadow-sm"
          title="Refresh List"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tests Taken
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((user) => {
                  const isExpired =
                    user.statusExpiry &&
                    new Date(user.statusExpiry) < new Date();
                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {getStatusBadge(user.status, user.statusExpiry, () =>
                            handleOpenInfoModal(user),
                          )}
                          {isExpired && (
                            <div className="text-xs text-red-500 mt-1">
                              Expired
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {user.tests}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                            Number(user.score) >= 7.0
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : Number(user.score) >= 5.0
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {user.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenStatusModal(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Info Modal */}
      {showInfoModal &&
        infoUser &&
        (() => {
          const isExpired =
            infoUser.statusExpiry &&
            new Date(infoUser.statusExpiry) < new Date();
          const expDate = infoUser.statusExpiry
            ? new Date(infoUser.statusExpiry)
            : null;
          const daysLeft = expDate
            ? Math.ceil(
                (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              )
            : null;

          const statusColors: Record<string, string> = {
            vip: "from-purple-500 to-indigo-600",
            premium: "from-blue-500 to-cyan-600",
            free: "from-gray-400 to-gray-500",
          };
          const gradient = statusColors[infoUser.status] || statusColors.free;

          return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className={`bg-linear-to-r ${gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                        {infoUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">
                          {infoUser.name}
                        </p>
                        <p className="text-white/70 text-sm">
                          {infoUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInfoModal(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={22} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {infoUser.status === "vip" ? (
                      <Crown size={18} />
                    ) : infoUser.status === "premium" ? (
                      <Shield size={18} />
                    ) : null}
                    <span className="text-2xl font-extrabold capitalize">
                      {infoUser.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Expiry info */}
                  {infoUser.status && expDate ? (
                    <div
                      className={`rounded-xl p-4 ${isExpired ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarCheck
                          size={16}
                          className={
                            isExpired ? "text-red-500" : "text-gray-500"
                          }
                        />
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Expiry Date
                        </span>
                      </div>
                      <p
                        className={`text-base font-bold ${isExpired ? "text-red-600" : "text-gray-800"}`}
                      >
                        {expDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {isExpired ? (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          ⚠ Subscription expired
                        </p>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-green-500" />
                          <p className="text-xs text-green-600 font-medium">
                            {daysLeft} days remaining
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          No active subscription
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Joined date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Member since</span>
                    <span className="font-medium text-gray-700">
                      {new Date(infoUser.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Mail size={16} />
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </button>
                  <button
                    onClick={() => {
                      setShowInfoModal(false);
                      handleOpenStatusModal(infoUser);
                    }}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Change Status
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Change User Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                User: <span className="font-semibold">{selectedUser.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Current Status:{" "}
                <span className="font-semibold capitalize">
                  {selectedUser.status}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "free" | "premium" | "vip")
                }
                className="w-full border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {newStatus !== "free" && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Duration (Months)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setDuration(months)}
                      className={`py-2 px-4 rounded-lg font-semibold transition ${
                        duration === months
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Expires:{" "}
                  {new Date(
                    new Date().setMonth(new Date().getMonth() + duration),
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
