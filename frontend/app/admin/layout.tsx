"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartPie,
  FaMapMarkedAlt,
  FaComments,
  FaUsers,
  FaList,
  FaFlag,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaBell,
} from "react-icons/fa";
import clsx from "clsx";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: <FaChartPie /> },
    { name: "Địa điểm", href: "/admin/locations", icon: <FaMapMarkedAlt /> },
    { name: "Bài viết", href: "/admin/posts", icon: <FaList /> },
    { name: "Bình luận", href: "/admin/comments", icon: <FaComments /> },
    { name: "Người dùng", href: "/admin/users", icon: <FaUsers /> },
    { name: "Danh mục", href: "/admin/categories", icon: <FaList /> },
    { name: "Báo cáo vi phạm", href: "/admin/reports", icon: <FaFlag /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
            V
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Admin Hệ Thống</h1>
            <p className="text-xs text-gray-400">Vietnam Travel Mgmt</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <FaCog /> Cài đặt
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="font-bold text-xl text-gray-800">
            {menuItems.find((i) => i.href === pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <FaBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Nguyễn Admin</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
                {/* Avatar Placeholder */}
                <img
                  src="https://ui-avatars.com/api/?name=Nguyen+Admin&background=0D8ABC&color=fff"
                  alt="Admin"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
