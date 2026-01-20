"use client";

import {
  FaUser,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import clsx from "clsx";
import { signOut } from "next-auth/react";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
}: SettingsSidebarProps) {
  const menuItems = [
    { id: "profile", label: "Hồ sơ", icon: FaUser },
    { id: "account", label: "Tài khoản", icon: FaCog },
    { id: "notifications", label: "Thông báo", icon: FaBell },
    { id: "security", label: "Bảo mật", icon: FaShieldAlt },
  ];

  return (
    <div className="w-full md:w-64 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-fit">
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <FaCog />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Cài đặt</h2>
            <p className="text-xs text-gray-500">Tùy chỉnh tài khoản</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <item.icon
                  className={clsx(
                    "text-lg",
                    activeTab === item.id ? "text-blue-600" : "text-gray-400",
                  )}
                />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-gray-100" />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
        >
          <FaSignOutAlt className="text-lg" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
