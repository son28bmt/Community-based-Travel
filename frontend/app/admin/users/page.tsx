"use client";

import { useState } from "react";
import {
  FaTrash,
  FaSearch,
  FaHistory,
  FaBan,
  FaUnlock,
  FaPlus,
  FaUserCog,
  FaUser,
  FaEnvelope,
  FaUserPlus,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 10,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/admin/users/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `${API_URL}/api/admin/users/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      toast.success("Đã xóa người dùng");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const users = data?.items || [];

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Giám sát, phân quyền và quản lý tài khoản thành viên hệ thống.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          aria-label="Thêm người dùng mới"
        >
          <FaPlus aria-hidden="true" /> Thêm mới
        </Link>
      </div>

      {/* Stats Cards - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          icon={<FaUserPlus />}
          color="blue"
          label="Người dùng mới (30 ngày)"
          value={statsData?.newUsers || 0}
        />
        <StatsCard
          icon={<FaUserCog />}
          color="green"
          label="Quản trị viên"
          value={statsData?.admins || 0}
        />
        <StatsCard
          icon={<FaBan />}
          color="red"
          label="Tài khoản bị khóa"
          value={statsData?.banned || 0}
        />
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <label htmlFor="search-users" className="sr-only">
              Tìm kiếm người dùng
            </label>
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="search-users"
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-1/2 sm:w-auto px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Lọc theo vai trò"
            >
              <option value="">Mọi vai trò</option>
              <option value="admin">Quản trị</option>
              <option value="user">Người dùng</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/2 sm:w-auto px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Mọi trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="banned">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-10 text-red-500">
            <p>Đã có lỗi xảy ra khi tải dữ liệu.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold"
            >
              Thử lại
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-gray-400">
            <FaUser className="text-4xl mb-4 opacity-20" />
            <p className="font-medium">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Thông tin</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4 text-center">Đóng góp</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user: any) => (
                    <tr
                      key={user._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {user.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              @{user.username || "user"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaEnvelope className="text-xs text-gray-400" />
                          <span className="truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-center">
                        {user.contributions || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          user={user}
                          updateMutation={updateMutation}
                          deleteMutation={deleteMutation}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {users.map((user: any) => (
                <div
                  key={user._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">
                          {user.name}
                        </h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Vai trò:</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <div className="flex justify-between">
                      <span>Đóng góp:</span>
                      <span className="font-bold">
                        {user.contributions || 0} bài
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <ActionButtons
                      user={user}
                      updateMutation={updateMutation}
                      deleteMutation={deleteMutation}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>
            Trang{" "}
            <span className="font-bold text-gray-800">
              {data?.pagination?.page || 1}
            </span>{" "}
            / {data?.pagination?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Trước
            </button>
            <button
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function StatsCard({ icon, color, label, value }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </h4>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-0.5 shadow-inner shrink-0 leading-none flex items-center justify-center">
      <img // Using img tag for external avatar service for simplicity, or Next Image if domain allowed
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`}
        className="w-full h-full object-cover rounded-full"
        alt={name}
        loading="lazy"
      />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border border-indigo-200">
        Admin
      </span>
    );
  }
  return (
    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border border-gray-200">
      User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Banned
    </span>
  );
}

function ActionButtons({ user, updateMutation, deleteMutation }: any) {
  return (
    <div className="flex justify-end gap-1">
      <button
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Lịch sử hoạt động"
        aria-label={`Xem lịch sử của ${user.name}`}
      >
        <FaHistory />
      </button>
      {user.status === "active" ? (
        <button
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Khóa người dùng"
          aria-label={`Khóa tài khoản ${user.name}`}
          onClick={() =>
            updateMutation.mutate({ id: user._id, status: "banned" })
          }
        >
          <FaBan />
        </button>
      ) : (
        <button
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Mở khóa"
          aria-label={`Mở khóa tài khoản ${user.name}`}
          onClick={() =>
            updateMutation.mutate({ id: user._id, status: "active" })
          }
        >
          <FaUnlock />
        </button>
      )}
      <button
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Xóa người dùng"
        aria-label={`Xóa tài khoản ${user.name}`}
        onClick={() => {
          if (confirm("Bạn có chắc chắn muốn xóa người dùng này?"))
            deleteMutation.mutate(user._id);
        }}
      >
        <FaTrash />
      </button>
    </div>
  );
}
