"use client";
import { FC } from "react";
import {
  BookOpen,
  Headphones,
  FileText,
  TrendingUp,
  Clock,
  User,
  MessageSquare,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Stats } from "@/types";

interface ActivityItem {
  type: "test" | "user" | "review";
  action: string;
  subject: string;
  createdAt: string;
}

interface DashboardContentProps {
  stats: Stats;
  activities?: ActivityItem[];
  loading: boolean;
  onViewAll?: () => void;
}

// Vaqtni chiroyli ko'rsatish funksiyasi
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export const DashboardContent: FC<DashboardContentProps> = ({
  // Agar stats undefined kelsa, default qiymat beramiz (Himoya)
  stats = {
    totalTests: 0,
    totalReadingTests: 0,
    totalListeningTests: 0,
  },
  activities = [],
  loading,
  onViewAll,
}) => {
  const statCards = [
    {
      label: "Total Tests",
      value: stats.totalTests, // Endi bu yerda xatolik bo'lmaydi
      icon: FileText,
      color: "blue",
    },
    {
      label: "Reading Tests",
      value: stats.totalReadingTests,
      icon: BookOpen,
      color: "green",
    },
    {
      label: "Listening Tests",
      value: stats.totalListeningTests,
      icon: Headphones,
      color: "purple",
    },
    {
      label: "Active Tests",
      value: stats.totalTests,
      icon: TrendingUp,
      color: "orange",
    },
  ];

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

  // Faqat oxirgi 3 ta aktivlikni olamiz
  const displayedActivities = activities.slice(0, 3);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your IELTS testing platform</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
              };
              const bgClass =
                colorClasses[card.color as keyof typeof colorClasses] ||
                "bg-gray-100 text-gray-600";

              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${bgClass.split(" ")[0]}`}>
                      <Icon className={bgClass.split(" ")[1]} size={24} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">
                    {card.value}
                  </h3>
                  <p className="text-gray-600 text-sm">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Recent Activity
                </h3>
                {onViewAll && (
                  <button
                    onClick={onViewAll}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    View All <ArrowRight size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3 flex-1">
                {displayedActivities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No recent activity.
                  </p>
                ) : (
                  displayedActivities.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm font-semibold truncate">
                          {activity.action}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {activity.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
                        <Clock size={12} />
                        <span>{timeAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-600" size={24} />
                    <span className="font-medium text-gray-700">
                      Reading Tests
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.totalReadingTests}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Headphones className="text-purple-600" size={24} />
                    <span className="font-medium text-gray-700">
                      Listening Tests
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.totalListeningTests}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
