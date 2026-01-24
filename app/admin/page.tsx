"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/admin/Sidebar";
import { DashboardContent } from "../components/admin/Dashboard";
import { TestsContent } from "../components/admin/TestContent";
import { UsersContent } from "../components/admin/UserContent";
import { ComingSoonContent } from "../components/admin/Soon";
import {
  ActiveSection, // <--- types/index.ts da ActiveSection ga 'activity' ni qo'shish kerak!
  Stats,
  ReadingTest,
  ListeningTest,
  ApiResponse,
} from "../../types/index";
import { ActivityContent } from "../components/admin/ActivityContent";

const API_BASE = "/api";

interface ActivityItem {
  type: "test" | "user" | "review";
  action: string;
  subject: string;
  createdAt: string;
}

export default function IELTSAdminPanel(): React.ReactElement {
  // Typescript "activity" ni tanimasa, types faylida update qilish kerak
  const [activeSection, setActiveSection] = useState<
    ActiveSection | "activity"
  >("dashboard");

  const [tests, setTests] = useState<Array<ReadingTest | ListeningTest>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    totalReadingTests: 0,
    totalListeningTests: 0,
    totalTests: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    } else if (activeSection === "reading" || activeSection === "listening") {
      fetchTests();
    }
    // Activity bo'limi o'z ichida fetch qiladi (ActivityContent.tsx)
  }, [activeSection]);

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async (): Promise<void> => {
    setLoading(true);
    try {
      const endpoint =
        activeSection === "reading"
          ? `${API_BASE}/reading`
          : `${API_BASE}/listening`;

      const response = await fetch(endpoint);
      const data: ApiResponse<ReadingTest[] | ListeningTest[]> =
        await response.json();

      if (data.success) {
        setTests(data.data);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Bu testni o'chirmoqchimisiz?")) return;
    try {
      const endpoint =
        activeSection === "reading"
          ? `${API_BASE}/reading/${id}`
          : `${API_BASE}/listening/${id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        await fetchTests();
        if (activeSection === "dashboard") await fetchDashboardData();
        window.alert("Test muvaffaqiyatli o'chirildi!");
      } else {
        window.alert(data.message || "O'chirishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      window.alert("Xatolik yuz berdi!");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar o'zgarmadi, lekin unga ham Activity button qo'shish mumkin */}
      <Sidebar
        activeSection={activeSection as ActiveSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 overflow-auto bg-white">
        {activeSection === "dashboard" && (
          <DashboardContent
            stats={stats}
            activities={activities}
            loading={loading}
            onViewAll={() => setActiveSection("activity")} // <--- O'TISH FUNKSIYASI
          />
        )}

        {/* --- YANGI COMPONENT RENDERI --- */}
        {activeSection === "activity" && <ActivityContent />}

        {(activeSection === "reading" || activeSection === "listening") && (
          <TestsContent
            type={activeSection === "reading" ? "reading" : "listening"}
            tests={tests}
            loading={loading}
            onDelete={handleDelete}
            onRefresh={fetchTests}
          />
        )}

        {activeSection === "users" && <UsersContent />}

        {(activeSection === "writing" || activeSection === "speaking") && (
          <ComingSoonContent
            type={activeSection === "writing" ? "writing" : "speaking"}
          />
        )}
      </div>
    </div>
  );
}
