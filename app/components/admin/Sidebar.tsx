"use client";
import React, { FC } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Users,
} from "lucide-react";
import { ActiveSection } from "@/types";

interface MenuItem {
  id: ActiveSection;
  label: string;
  icon: React.FC<{ size?: number | string; className?: string }>;
  active: boolean;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "reading", label: "Reading", icon: BookOpen, active: true },
  { id: "listening", label: "Listening", icon: Headphones, active: true },
  { id: "writing", label: "Writing", icon: PenTool, active: false },
  { id: "speaking", label: "Speaking", icon: Mic, active: false },
  { id: "users", label: "Users", icon: Users, active: true },
];

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export const Sidebar: FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <div className="w-64 bg-linear-to-b from-blue-600 to-blue-700 shadow-xl flex flex-col">
      <div className="p-6 border-b border-blue-500/30">
        <h1 className="text-2xl font-bold text-white">IELTS Admin</h1>
        <p className="text-blue-100 text-sm mt-1">Test Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => item.active && onSectionChange(item.id)}
              disabled={!item.active}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? "bg-white text-blue-600 shadow-lg font-semibold"
                  : item.active
                  ? "text-blue-50 hover:bg-blue-500/50"
                  : "text-blue-300 cursor-not-allowed"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {!item.active && (
                <span className="ml-auto text-xs bg-blue-800 px-2 py-1 rounded text-blue-200">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500/30">
        <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-400/30">
          <p className="text-white font-semibold mb-1 text-sm">Need Help?</p>
          <p className="text-blue-200 text-xs">Contact support team</p>
        </div>
      </div>
    </div>
  );
};
