"use client";
import { FC } from "react";
import {
  BookOpen,
  Headphones,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Stats } from "@/types";

interface DashboardContentProps {
  stats: Stats;
  loading: boolean;
}

export const DashboardContent: FC<DashboardContentProps> = ({
  stats,
  loading,
}) => {
  const statCards = [
    {
      label: "Total Tests",
      value: stats.totalTests,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              const bgClass =
                card.color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : card.color === "green"
                  ? "bg-green-100 text-green-600"
                  : card.color === "purple"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-orange-100 text-orange-600";

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
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: "New test created",
                    test: "Reading Test",
                    time: "2 hours ago",
                  },
                  {
                    action: "Test updated",
                    test: "Listening Test",
                    time: "5 hours ago",
                  },
                  {
                    action: "User registered",
                    test: "New user",
                    time: "1 day ago",
                  },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <Clock className="text-blue-600" size={20} />
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm font-medium">
                        {activity.action}
                      </p>
                      <p className="text-gray-500 text-xs">{activity.test}</p>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
