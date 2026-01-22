"use client";
import React, { FC, useEffect, useState } from "react";
import { Search } from "lucide-react";

interface AppUser {
  id: number;
  name: string;
  email: string;
  tests: number;
  score: number;
}
type TestType = "reading" | "listening" | "speaking" | "writing";
interface PerformanceByType {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}
interface StatsResponse {
  success: boolean;
  data?: {
    stats: {
      totalTests: number;
      averageBand: number;
      studyStreak: number;
      hoursStudied: number;
    };
    recentTests: {
      id: string;
      type: TestType;
      score: number;
      bandScore: number;
      date: string | Date;
    }[];
    performanceByType: PerformanceByType;
    user: {
      name: string;
      email: string;
      avatar?: string;
      role: string;
      joinedAt: Date;
    };
  };
  error?: string;
}
export const UsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<StatsResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  useEffect(() => {
    loadUser();
  }, []);
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user/stats`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setTimeRemaining(
          result.data.timeLimit ? result.data.timeLimit * 60 : 1800
        );
        console.log("Loaded user:", result.data);
      } else {
        setError(result.error || "Failed to load user");
      }
    } catch (error: any) {
      console.error("Error loading user:", error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };
  const mockUsers: AppUser[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      tests: 5,
      score: 7.5,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      tests: 3,
      score: 8.0,
    },
    {
      id: 3,
      name: "Ali Karimov",
      email: "ali@example.com",
      tests: 8,
      score: 6.5,
    },
  ];

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Users</h2>
        <p className="text-gray-600">Manage registered users</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b">
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
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tests Taken
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Avg Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-700">{user.tests}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {user.score}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
