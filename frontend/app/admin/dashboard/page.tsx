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

export default function AdminDashboardPage() {
  const data = [
    { name: "1 Thg 5", value: 4000 },
    { name: "5 Thg 5", value: 3000 },
    { name: "10 Thg 5", value: 5000 },
    { name: "15 Thg 5", value: 2780 },
    { name: "20 Thg 5", value: 6890 },
    { name: "25 Thg 5", value: 4390 },
    { name: "Hôm nay", value: 6490 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Tổng người dùng
              </p>
              <h3 className="text-3xl font-bold text-gray-800">12,540</h3>
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

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Địa điểm hoạt động
              </p>
              <h3 className="text-3xl font-bold text-gray-800">842</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <FaMapMarkerAlt />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              ↗ +5.2%
            </span>
            <span className="text-gray-400">địa điểm mới</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Chờ phê duyệt
              </p>
              <h3 className="text-3xl font-bold text-gray-800">15</h3>
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

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Báo cáo mới
              </p>
              <h3 className="text-3xl font-bold text-gray-800">3</h3>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Tương tác người dùng
              </h3>
              <p className="text-sm text-gray-500">
                Dữ liệu hoạt động trong 30 ngày qua
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100">
                30 Ngày
              </button>
              <button className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100">
                90 Ngày
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <button className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-blue-100 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FaCheckCircle />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Duyệt địa điểm mới
                    </h4>
                    <p className="text-xs text-gray-500">15 yêu cầu đang chờ</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-blue-500" />
              </button>

              <button className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-red-100 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <FaCommentDots />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Xem báo cáo bình luận
                    </h4>
                    <p className="text-xs text-gray-500">3 báo cáo mới</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-red-500" />
              </button>

              <button className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-green-100 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <FaUserPlus />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Thêm quản trị viên
                    </h4>
                    <p className="text-xs text-gray-500">
                      Quản lý quyền truy cập
                    </p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-green-500" />
              </button>

              <button className="w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                    <FaFileDownload />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Xuất báo cáo tháng
                    </h4>
                    <p className="text-xs text-gray-500">Tải file PDF/Excel</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Locations Table (Placeholder) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Địa điểm mới chờ duyệt
          </h3>
          <button className="text-blue-500 text-sm font-bold hover:underline">
            Xem tất cả &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Tên Địa điểm</th>
                <th className="px-4 py-3">Vị trí</th>
                <th className="px-4 py-3">Người đăng</th>
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-800">
                    Cà phê Rooftop Sài Gòn
                  </td>
                  <td className="px-4 py-4 text-gray-500">Quận 1, TP.HCM</td>
                  <td className="px-4 py-4 text-gray-500">trung_nguyen_99</td>
                  <td className="px-4 py-4 text-gray-500">2 giờ trước</td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-blue-600 font-bold hover:underline mr-3">
                      Duyệt
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      Từ chối
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
}
