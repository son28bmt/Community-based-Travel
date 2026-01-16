"use client";

import { useState } from "react";
import {
  FaTrash,
  FaCheck,
  FaSearch,
  FaFilter,
  FaStar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminCommentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = async () => {
    try {
      const toastId = toast.loading("Đang xuất dữ liệu...");
      const res = await axios.get("http://localhost:5000/api/admin/reviews", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          limit: 1000, // Export limit
          search: search || undefined,
          status: statusFilter || undefined,
          rating: ratingFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      const items = res.data.items || [];
      const csvContent = [
        [
          "ID",
          "User",
          "Email",
          "Location",
          "Rating",
          "Content",
          "Status",
          "Date",
        ],
        ...items.map((item: any) => [
          item._id,
          item.userName || item.user?.name,
          item.userEmail || item.user?.email,
          item.location?.name,
          item.rating,
          `"${item.content.replace(/"/g, '""')}"`, // Escape quotes
          item.status,
          new Date(item.createdAt).toISOString().split("T")[0],
        ]),
      ]
        .map((e) => e.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Xuất báo cáo thành công", { id: toastId });
    } catch (error) {
      toast.error("Lỗi khi xuất dữ liệu");
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "admin-reviews",
      page,
      search,
      statusFilter,
      ratingFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/reviews", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          rating: ratingFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-reviews-stats"],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/reviews/stats",
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/reviews/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`http://localhost:5000/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      toast.success("Đã xóa đánh giá");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const reviews = data?.items || [];

  const getStatusBadge = (status: string) => {
    if (status === "reported") {
      return (
        <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">
          Bị báo cáo
        </span>
      );
    }
    if (status === "hidden") {
      return (
        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">
          Đã ẩn
        </span>
      );
    }
    return (
      <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold">
        Hợp lệ
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Bình luận & Đánh giá
          </h1>
          <p className="text-gray-500">
            Kiểm duyệt nội dung, xử lý báo cáo và đánh giá từ người dùng.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
          Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Tổng đánh giá
          </h3>
          <div className="text-3xl font-bold text-gray-800">
            {statsData?.total || 0}
          </div>
          <div className="text-green-500 text-xs font-bold mt-1">
            Toàn thời gian
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Bị báo cáo
          </h3>
          <div className="text-3xl font-bold text-red-600">
            {statsData?.reported || 0}
          </div>
          <div className="text-red-500 text-xs font-bold mt-1">Cần xem xét</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Điểm trung bình
          </h3>
          <div className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
            {(statsData?.avgRating || 0).toFixed(1)}/5.0 <FaStar size={20} />
          </div>
          <div className="text-gray-400 text-xs font-bold mt-1">
            Dựa trên {statsData?.ratingCount || 0} lượt đánh giá
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Đã ẩn
          </h3>
          <div className="text-3xl font-bold text-gray-800">
            {statsData?.hidden || 0}
          </div>
          <div className="text-gray-400 text-xs font-bold mt-1">
            Bởi quản trị viên
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm người dùng, email, địa điểm hoặc nội dung..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {[
            { label: "Tất cả", value: "" },
            { label: "Bị báo cáo", value: "reported" },
            { label: "Đã ẩn", value: "hidden" },
            { label: "Hợp lệ", value: "clean" },
          ].map((item) => (
            <button
              key={item.value || "all"}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
                statusFilter === item.value
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 outline-none focus:border-blue-500"
          >
            <option value="">Tất cả sao</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} sao
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 bg-white">
            <input
              type="date"
              className="py-2 text-sm text-gray-600 outline-none bg-transparent"
              title="Từ ngày"
              onChange={(e) => {
                // Update query state if we had it, for now just placeholder or we can add state
                // To minimize complexity in this step, let's assume we'll add state in next step or use simple date logic
              }}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="py-2 text-sm text-gray-600 outline-none bg-transparent"
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Đánh giá</th>
              <th className="px-6 py-4 w-1/3">Nội dung</th>
              <th className="px-6 py-4">Địa điểm</th>
              <th className="px-6 py-4">Báo cáo</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={7}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-6 py-6 text-red-500" colSpan={7}>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={7}>
                  Chưa có đánh giá nào.
                </td>
              </tr>
            ) : (
              reviews.map((review: any) => {
                const displayName =
                  review.user?.name || review.userName || "Ẩn danh";
                const displayEmail =
                  review.user?.email || review.userEmail || "n/a";
                return (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gray-700">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {displayName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? "" : "text-gray-300"}
                            size={12}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic">
                      "{review.content}"
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {review.location?.name || "Không xác định"}
                    </td>
                    <td className="px-6 py-4">
                      {review.reportCount > 0 ? (
                        <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                          {review.reportCount} báo cáo
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded text-xs font-bold">
                          0 báo cáo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-gray-400">
                        <button
                          className="hover:text-green-500 transition-colors"
                          title="Đánh dấu hợp lệ"
                          onClick={() =>
                            updateMutation.mutate({
                              id: review._id,
                              status: "clean",
                            })
                          }
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="hover:text-orange-500 transition-colors"
                          title="Báo cáo vi phạm"
                          onClick={() =>
                            updateMutation.mutate({
                              id: review._id,
                              status: "reported",
                            })
                          }
                        >
                          <FaExclamationTriangle />
                        </button>
                        <button
                          className="hover:text-red-500 transition-colors"
                          title="Xóa đánh giá"
                          onClick={() => deleteMutation.mutate(review._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
