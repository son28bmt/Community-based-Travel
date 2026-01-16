"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBell,
  FaChartPie,
  FaCity,
  FaCog,
  FaComments,
  FaFlag,
  FaList,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type MenuGroup = {
  name: string;
  icon: React.ReactNode;
  children: MenuItem[];
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: Array<MenuItem | MenuGroup> = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: <FaChartPie /> },
    {
      name: "Địa điểm",
      icon: <FaMapMarkedAlt />,
      children: [
        {
          name: "Quản lý thành phố",
          href: "/admin/locations/cities",
          icon: <FaCity />,
        },
        {
          name: "Quản lý địa điểm",
          href: "/admin/locations",
          icon: <FaMapMarkerAlt />,
        },
      ],
    },
    { name: "Bài viết", href: "/admin/posts", icon: <FaList /> },
    { name: "Bình luận", href: "/admin/comments", icon: <FaComments /> },
    { name: "Người dùng", href: "/admin/users", icon: <FaUsers /> },
    { name: "Danh mục", href: "/admin/categories", icon: <FaList /> },
    { name: "Báo cáo vi phạm", href: "/admin/reports", icon: <FaFlag /> },
  ];

  const flatMenuItems = menuItems.flatMap((item) =>
    "children" in item ? item.children : [item]
  );

  const pageTitle =
    flatMenuItems.find((item) => item.href === pathname)?.name || "Dashboard";

  // Notification Logic
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const { data: notificationData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params: { limit: 10, exclude_type: "admin_system" },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.patch(
        `http://localhost:5000/api/admin/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return axios.patch(
        "http://localhost:5000/api/admin/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notificationData?.unreadCount || 0;
  const notifications = notificationData?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
            V
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Admin Hệ Thống</h1>
            <p className="text-xs text-gray-400">Vietnam Travel Mgmt</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) =>
            "children" in item ? (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700">
                  {item.icon}
                  {item.name}
                </div>
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                        pathname === child.href
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {child.icon}
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
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
                {item.name === "Thông báo" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          )}
          {/* Manually add Notification Link for sidebar consistency if not in array */}
          <Link
            href="/admin/notifications"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              pathname === "/admin/notifications"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <FaBell />
            Thông báo
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

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

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="font-bold text-xl text-gray-800">{pageTitle}</h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
              />
            </div>
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                title="Thông báo"
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 rounded-full border border-white text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2"
                    style={{ zIndex: 100 }}
                  >
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
                      <p className="text-sm font-bold text-gray-900">
                        Thông báo
                      </p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Đánh dấu đã đọc hết
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          Không có thông báo mới
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notif: any) => (
                            <div
                              key={notif._id}
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notif.isRead ? "bg-blue-50/50" : ""
                              }`}
                              onClick={() => {
                                if (!notif.isRead) {
                                  markReadMutation.mutate(notif._id);
                                }
                                if (notif.link) {
                                  setShowNotifications(false);
                                  router.push(notif.link);
                                }
                              }}
                            >
                              <div className="flex gap-3">
                                <div className="shrink-0 mt-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.type === "admin_system" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                                  >
                                    <FaBell size={12} />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p
                                    className={`text-sm ${!notif.isRead ? "font-bold text-gray-900" : "text-gray-700"}`}
                                  >
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(
                                      notif.createdAt
                                    ).toLocaleDateString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <div className="shrink-0 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-50 bg-gray-50 text-center">
                      <Link
                        href="/admin/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Nguyễn Admin</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
                <img
                  src="https://ui-avatars.com/api/?name=Nguyen+Admin&background=0D8ABC&color=fff"
                  alt="Admin"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
