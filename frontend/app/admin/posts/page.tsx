"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCheck,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminPostsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-posts", page, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/posts", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-select"],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/categories",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`http://localhost:5000/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Đã xóa bài viết");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/posts/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể cập nhật");
    },
  });

  const posts = data?.items || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Đã đăng
          </span>
        );
      case "pending":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            Chờ duyệt
          </span>
        );
      case "hidden":
        return (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
            Đã ẩn
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h1>
          <p className="text-gray-500">
            Kiểm duyệt và quản lý các bài viết từ cộng đồng.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
        >
          + Viết bài mới
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {["", "pending", "published", "hidden"].map((status) => (
            <button
              key={status || "all"}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                statusFilter === status
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status === ""
                ? "Tất cả"
                : status === "pending"
                  ? "Chờ duyệt"
                  : status === "published"
                    ? "Đã đăng"
                    : "Đã ẩn"}
            </button>
          ))}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 outline-none focus:border-blue-500 hover:bg-gray-50 bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesData?.items?.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Bài viết</th>
              <th className="px-6 py-4">Tác giả</th>
              <th className="px-6 py-4">Chuyên mục</th>
              <th className="px-6 py-4">Lượt xem</th>
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
                  Có lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  Chưa có bài viết nào.
                </td>
              </tr>
            ) : (
              posts.map((post: any) => (
                <tr
                  key={post._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 mb-1 line-clamp-1">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {post.createdBy?.name || "Admin"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                      {post.category || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{post.views}</td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {post.status === "pending" ? (
                      <button
                        className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 mr-2 inline-flex items-center gap-2"
                        onClick={() =>
                          updateMutation.mutate({
                            id: post._id,
                            status: "published",
                          })
                        }
                      >
                        <FaCheck /> Duyệt
                      </button>
                    ) : (
                      <div className="flex justify-end gap-2 text-gray-400">
                        <Link
                          href={`/admin/posts/${post._id}`}
                          className="hover:text-blue-500"
                        >
                          <FaEdit />
                        </Link>
                        <button className="hover:text-gray-600">
                          <FaEye />
                        </button>
                        <button
                          className="hover:text-red-500"
                          onClick={() => deleteMutation.mutate(post._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
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
    </div>
  );
}
