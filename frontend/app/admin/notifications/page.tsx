"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  FaBell,
  FaCheckDouble,
  FaSpinner,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-notifications", page],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params: { page, limit: 20 },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
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
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications-count"],
      });
      toast.success("Đã đánh dấu tất cả là đã đọc");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.patch(
        `http://localhost:5000/api/admin/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications-count"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(
        `http://localhost:5000/api/admin/notifications/${id}`,
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-notifications-count"],
      });
      toast.success("Đã xóa thông báo");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      return axios.post(
        "http://localhost:5000/api/admin/notifications",
        formData,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      // Reset to page 1 to see the new notification
      setPage(1);
      toast.success("Đã gửi thông báo");
      setIsCreateModalOpen(false);
      setNewNotification({
        title: "",
        message: "",
        recipientId: "all",
        link: "",
        type: "admin_system",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gửi thất bại");
    },
  });

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    recipientId: "all",
    link: "",
    type: "admin_system",
  });

  const notifications = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Gửi thông báo mới
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Người nhận
                </label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={newNotification.recipientId}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      recipientId: e.target.value,
                    })
                  }
                >
                  <option value="all">Tất cả người dùng (Broadcast)</option>
                  <option value="specific">Người dùng cụ thể (Nhập ID)</option>
                </select>
                {newNotification.recipientId !== "all" && (
                  <input
                    placeholder="Nhập User ID người nhận..."
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={
                      newNotification.recipientId === "specific"
                        ? ""
                        : newNotification.recipientId
                    }
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        recipientId: e.target.value,
                      })
                    }
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Tiêu đề
                </label>
                <input
                  placeholder="Tiêu đề thông báo..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Nội dung
                </label>
                <textarea
                  placeholder="Nội dung thông báo..."
                  className="w-full p-2 h-24 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      message: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Liên kết (Tùy chọn)
                </label>
                <input
                  placeholder="VD: /kham-pha/123"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={newNotification.link}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      link: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (
                    !newNotification.title.trim() ||
                    !newNotification.message.trim()
                  ) {
                    return toast.error("Vui lòng nhập tiêu đề và nội dung");
                  }
                  if (
                    newNotification.recipientId === "specific" ||
                    !newNotification.recipientId
                  ) {
                    return toast.error("Vui lòng nhập ID người nhận");
                  }
                  createMutation.mutate(newNotification);
                }}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                {createMutation.isPending && (
                  <FaSpinner className="animate-spin" />
                )}
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaBell className="text-blue-500" /> Thông báo hệ thống
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật mới nhất về các hoạt động trên hệ thống.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> Gửi thông báo
          </button>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckDouble className="text-blue-600" />
            )}
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Đang tải thông báo...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Có lỗi khi tải thông báo.
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FaBell size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Bạn chưa có thông báo nào
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Khi có hoạt động mới, chúng sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif: any) => (
              <div
                key={notif._id}
                className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 group relative ${
                  !notif.isRead ? "bg-blue-50/50" : ""
                }`}
              >
                <div
                  className="flex-1 flex gap-4 cursor-pointer"
                  onClick={() => {
                    if (!notif.isRead) markAsReadMutation.mutate(notif._id);
                  }}
                >
                  <div className="shrink-0 pt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notif.type === "new_location"
                          ? "bg-green-100 text-green-600"
                          : notif.type === "report"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <FaBell />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4
                        className={`text-sm font-bold ${
                          !notif.isRead ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xem chi tiết →
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 pl-4 border-l border-gray-100 ml-2">
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mb-auto mt-2"></div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Xóa thông báo này?")) {
                        deleteMutation.mutate(notif._id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa thông báo"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination if needed */}
        {data?.pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Trang {page} / {data.pagination.totalPages}
            </span>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
