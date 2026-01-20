"use client";

import {
  FaUsers,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaExclamationCircle,
  FaArrowRight,
  FaCommentDots,
  FaUserPlus,
  FaFileDownload,
  FaCheckCircle,
} from "react-icons/fa";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const chartData = [
    { name: "1 Thg 5", value: 4000 },
    { name: "5 Thg 5", value: 3000 },
    { name: "10 Thg 5", value: 5000 },
    { name: "15 Thg 5", value: 2780 },
    { name: "20 Thg 5", value: 6890 },
    { name: "25 Thg 5", value: 4390 },
    { name: "Hôm nay", value: 6490 },
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Tổng người dùng
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats?.totalUsers || 0}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <FaUsers />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              ↗ +12.5%
            </span>
            <span className="text-gray-400">so với tháng trước</span>
          </div>
        </div>

        {/* Card 2: Locations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Địa điểm hoạt động
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats?.totalLocations || 0}
              </h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <FaMapMarkerAlt />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-gray-400">Được phê duyệt</span>
          </div>
        </div>

        {/* Card 3: Pending Locations */}
        <Link href="/admin/locations?status=pending" className="block">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-orange-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Chờ phê duyệt
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats?.pendingLocations || 0}
                </h3>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                <FaClipboardCheck />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                ! Ưu tiên xử lý
              </span>
            </div>
          </div>
        </Link>

        {/* Card 4: Reports */}
        <Link href="/admin/reports?status=pending" className="block">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-red-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Báo cáo mới
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats?.newReports || 0}
                </h3>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                <FaExclamationCircle />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                Cần kiểm tra ngay
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Mocked for now as backend doesn't support aggregation yet */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Tương tác người dùng
              </h3>
              <p className="text-sm text-gray-500">
                Dữ liệu hoạt động (Giả lập)
              </p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {typeof window !== "undefined" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/locations?status=pending"
                className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-blue-100 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FaCheckCircle />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Duyệt địa điểm mới
                    </h4>
                    <p className="text-xs text-gray-500">
                      {stats?.pendingLocations || 0} yêu cầu đang chờ
                    </p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-blue-500" />
              </Link>

              <Link
                href="/admin/reports"
                className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-red-100 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <FaCommentDots />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Xem báo cáo bình luận
                    </h4>
                    <p className="text-xs text-gray-500">
                      {stats?.newReports || 0} báo cáo mới
                    </p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-red-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Locations Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Địa điểm mới chờ duyệt
          </h3>
          <Link
            href="/admin/locations?status=pending"
            className="text-blue-500 text-sm font-bold hover:underline"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {stats?.recentPendingLocations?.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stats.recentPendingLocations.map((loc: any) => (
                <div
                  key={loc._id}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 line-clamp-1">
                      {loc.name}
                    </h4>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Chờ duyệt
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />{" "}
                      {loc.province}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaUsers className="text-gray-400" />{" "}
                      {loc.createdBy?.username || "Ẩn danh"}
                    </p>
                    <p className="flex items-center gap-2 text-xs">
                      <span className="w-4 inline-block text-center">📅</span>{" "}
                      {new Date(loc.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Link
                    href={`/admin/locations/${loc._id}`}
                    className="block w-full text-center py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-bold shadow-sm"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Tên Địa điểm</th>
                    <th className="px-4 py-3">Vị trí</th>
                    <th className="px-4 py-3">Người đăng</th>
                    <th className="px-4 py-3">Ngày gửi</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {stats.recentPendingLocations.map((loc: any) => (
                    <tr
                      key={loc._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 max-w-[200px] truncate">
                        {loc.name}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {loc.province}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {loc.createdBy?.username || "Ẩn danh"}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(loc.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/locations/${loc._id}`}
                          className="text-blue-600 font-bold hover:underline mr-3"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FaClipboardCheck className="mx-auto text-gray-300 text-4xl mb-3" />
            <p>Tuyệt vời! Không có địa điểm nào đang chờ duyệt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
