"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEdit, FaEye, FaTrash, FaSearch, FaCheck } from "react-icons/fa";
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
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/admin/posts",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params: {
            page,
            limit: 10,
            search: search || undefined,
            status: statusFilter || undefined,
            category: categoryFilter || undefined,
          },
        },
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-select"],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/admin/categories",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/admin/posts/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Đã xóa bài viết");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/admin/posts/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Đã cập nhật trạng thái");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["", "pending", "published", "hidden"].map((status) => (
              <button
                key={status || "all"}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex-shrink-0 ${
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
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 outline-none focus:border-blue-500 hover:bg-gray-50 bg-white w-full md:w-auto"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesData?.items?.map(
              (cat: { _id: string; name: string }) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="w-full md:w-auto relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {isLoading ? (
          <div className="text-center p-4 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : isError ? (
          <div className="text-center p-4 text-red-500">Có lỗi xảy ra.</div>
        ) : posts.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Chưa có bài viết nào.
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts.map((post: any) => (
            <div
              key={post._id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative"
            >
              <div className="absolute top-4 right-4">
                {getStatusBadge(post.status)}
              </div>
              <div className="pr-16 mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-2">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.createdBy?.name || "Admin"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase border border-gray-100">
                  {post.category || "N/A"}
                </span>
                <span className="text-xs text-gray-400">
                  {post.views} lượt xem
                </span>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                {post.status === "pending" ? (
                  <button
                    className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 flex items-center justify-center gap-2"
                    onClick={() =>
                      updateMutation.mutate({
                        id: post._id,
                        status: "published",
                      })
                    }
                  >
                    <FaCheck /> Duyệt bài viết
                  </button>
                ) : (
                  <div className="flex w-full gap-2">
                    <Link
                      href={`/admin/posts/${post._id}`}
                      className="flex-1 py-2 text-center border border-blue-100 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
                    >
                      Sửa
                    </Link>
                    <button
                      className="flex-1 py-2 text-center border border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(post._id)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        <Link
                          href={`/bai-viet/${post._id}`}
                          target="_blank"
                          className="hover:text-gray-600"
                        >
                          <FaEye />
                        </Link>
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
