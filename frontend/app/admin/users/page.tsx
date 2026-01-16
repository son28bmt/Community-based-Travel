"use client";

// Ensure UTF-8 encoding
import { useState } from "react";
import {
  FaTrash,
  FaSearch,
  FaHistory,
  FaBan,
  FaUnlock,
  FaPlus,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
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
      const res = await axios.get(
        "http://localhost:5000/api/admin/users/stats",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/users/${id}`,
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
      return axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
          <p className="text-gray-500">
            Giám sát và phân quyền truy cập cho người dùng trên hệ thống.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Thêm người dùng
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-blue-100 bg-white rounded-lg text-sm font-medium text-gray-600 outline-none"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-red-100 bg-white rounded-lg text-sm font-medium text-gray-600 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị khóa</option>
          </select>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 min-w-[300px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Đóng góp</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-6 py-6 text-red-500" colSpan={6}>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                          className="w-full h-full object-cover"
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
                        Người dùng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {user.contributions || 0}
                  </td>
                  <td className="px-6 py-4">
                    {user.status === "active" ? (
                      <span className="text-green-600 font-bold text-xs">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs">
                        Bị khóa
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
                          title="Khóa người dùng"
                          onClick={() =>
                            updateMutation.mutate({
                              id: user._id,
                              status: "banned",
                            })
                          }
                        >
                          <FaBan />
                        </button>
                      ) : (
                        <button
                          className="hover:text-green-500"
                          title="Mở khóa"
                          onClick={() =>
                            updateMutation.mutate({
                              id: user._id,
                              status: "active",
                            })
                          }
                        >
                          <FaUnlock />
                        </button>
                      )}
                      <button
                        className="hover:text-red-500"
                        title="Xóa người dùng"
                        onClick={() => deleteMutation.mutate(user._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>
            Trang {data?.pagination?.page || 1} /{" "}
            {data?.pagination?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
            +
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Người dùng mới (30 ngày)
            </h4>
            <span className="text-2xl font-bold text-gray-800">
              {statsData?.newUsers || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Quản trị viên
            </h4>
            <span className="text-2xl font-bold text-gray-800">
              {statsData?.admins || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-xl">
            !
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-bold uppercase">
              Tài khoản bị khóa
            </h4>
            <span className="text-2xl font-bold text-gray-800">
              {statsData?.banned || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
