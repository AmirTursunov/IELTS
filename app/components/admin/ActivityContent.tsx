"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  User,
  MessageSquare,
  Activity,
  Clock,
  RefreshCw,
} from "lucide-react";

interface ActivityItem {
  _id?: string;
  type: "test" | "user" | "review";
  action: string;
  subject: string;
  createdAt: string;
}

export const ActivityContent = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error("Error loading activities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "test":
        return <FileText size={20} className="text-blue-600" />;
      case "user":
        return <User size={20} className="text-green-600" />;
      case "review":
        return <MessageSquare size={20} className="text-purple-600" />;
      default:
        return <Activity size={20} className="text-gray-600" />;
    }
  };

  // Sana formatlash
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Activity Log
          </h2>
          <p className="text-gray-600">Full history of platform activities</p>
        </div>
        <button
          onClick={fetchActivities}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No activities found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">
                    Type
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">
                    Action
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">
                    Subject
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getActivityIcon(item.type)}
                        </div>
                        <span className="capitalize font-medium text-gray-700">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {item.action}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.subject}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                      <Clock size={14} />
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
