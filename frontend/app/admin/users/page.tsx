"use client";

import {
  FaEdit,
  FaLock,
  FaTrash,
  FaCheckCircle,
  FaSearch,
  FaHistory,
  FaBan,
  FaUnlock,
} from "react-icons/fa";

export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: "Trần Thanh Tùng",
      email: "tung.tt@gmail.com",
      role: "admin",
      contributions: 156,
      status: "active",
      avatar: "bg-orange-200",
    },
    {
      id: 2,
      name: "Lê Minh Hạnh",
      email: "hanh.le92@outlook.com",
      role: "user",
      contributions: 42,
      status: "active",
      avatar: "bg-orange-300",
    },
    {
      id: 3,
      name: "Nguyễn Tuấn Hải",
      email: "hai.nt@gmail.com",
      role: "user",
      contributions: 12,
      status: "banned",
      avatar: "bg-orange-100",
    },
    {
      id: 4,
      name: "Phạm Quỳnh Chi",
      email: "chi.pq.travel@vn.co",
      role: "user",
      contributions: 89,
      status: "active",
      avatar: "bg-orange-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
          <p className="text-gray-500">
            Theo dõi và quản lý các thành viên trong cộng đồng du lịch.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
          + Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
            Tất cả (1,240)
          </button>
          <select className="px-3 py-2 border border-blue-100 bg-white rounded-lg text-sm font-medium text-gray-600 outline-none">
            <option>Quản trị viên</option>
            <option>Thành viên</option>
          </select>
          <select className="px-3 py-2 border border-red-100 bg-white rounded-lg text-sm font-medium text-red-500 outline-none">
            <option>Bị khóa</option>
            <option>Hoạt động</option>
          </select>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 min-w-[300px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Đóng góp</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${user.avatar} flex items-center justify-center`}
                    >
                      {/* Avatar placeholder */}
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                        className="rounded-full"
                        alt={user.name}
                      />
                    </div>
                    <h4 className="font-bold text-gray-800">{user.name}</h4>
                  </div>
                </td>
                <td className="px-6 py-4 text-blue-600 font-medium">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  {user.role === "admin" ? (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                      Quản trị viên
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                      Thành viên
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  {user.contributions}
                </td>
                <td className="px-6 py-4">
                  {user.status === "active" ? (
                    <span className="text-green-600 font-bold flex items-center gap-1 text-xs">
                      ● Hoạt động
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1 text-xs">
                      ● Bị khóa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button
                      className="hover:text-blue-500"
                      title="Lịch sử hoạt động"
                    >
                      <FaHistory />
                    </button>
                    {user.status === "active" ? (
                      <button
                        className="hover:text-red-500"
                        title="Khóa tài khoản"
                      >
                        <FaBan />
                      </button>
                    ) : (
                      <button className="hover:text-green-500" title="Mở khóa">
                        <FaUnlock />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Hiển thị 1-10 trong số 1,240 người dùng</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
              ...
            </button>
          </div>
        </div>
      </div>

      {/* Brief Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
            ↗
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Người dùng mới (Tháng này)
            </h4>
            <span className="text-2xl font-bold text-gray-800">+124</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center font-bold text-xl">
            💬
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Tổng số đóng góp
            </h4>
            <span className="text-2xl font-bold text-gray-800">15.4k</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-xl">
            !
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Báo cáo chờ xử lý
            </h4>
            <span className="text-2xl font-bold text-gray-800">08</span>
          </div>
        </div>
      </div>
    </div>
  );
}
