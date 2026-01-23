"use client";

import { useState } from "react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import { FaExclamationCircle } from "react-icons/fa";

// Placeholder for other tabs
const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 text-2xl">
      <FaExclamationCircle />
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-2">{name}</h2>
    <p className="text-gray-500">Chức năng đang được phát triển.</p>
  </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar */}
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && <ProfileSettings />}
            {(activeTab === "account" || activeTab === "security") && (
              <AccountSettings />
            )}
            {activeTab === "notifications" && (
              <PlaceholderTab name="Cài đặt Thông báo" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
