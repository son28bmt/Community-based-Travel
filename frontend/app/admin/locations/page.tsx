"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  FaCheck,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes, // Used for Reject icon
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

// Modal Component for Rejection
const RejectionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Từ chối địa điểm</h3>
        <p className="text-sm text-gray-500">
          Vui lòng nhập lý do từ chối để thông báo cho người đóng góp.
        </p>
        <textarea
          className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
          placeholder="Nhập lý do..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) return toast.error("Vui lòng nhập lý do");
              onSubmit(reason);
              setReason("");
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

interface City {
  _id: string;
  name: string;
}

interface Location {
  _id: string;
  name: string;
  province: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export default function AdminLocationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterProvince, setFilterProvince] = useState("");

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: citiesData } = useQuery({
    queryKey: ["admin-cities-select"],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/admin/cities",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params: { limit: 100 },
        },
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-locations", page, search, filterCategory, filterProvince],
    queryFn: async () => {
      // Build query params
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        search,
      };
      if (filterCategory) params.category = filterCategory;
      if (filterProvince) params.province = filterProvince;

      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/admin/locations",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params,
        },
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/admin/locations/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Đã xóa địa điểm");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: string;
      rejectionReason?: string;
    }) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/admin/locations/${id}`,
        { status, rejectionReason },
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-locations-stats"] }); // Update stats too
      toast.success("Cập nhật trạng thái thành công");
      setIsRejectModalOpen(false);
      setSelectedLocationId(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    setProcessingId(id);
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const handleRejectClick = (id: string) => {
    setSelectedLocationId(id);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = (reason: string) => {
    if (selectedLocationId) {
      updateStatusMutation.mutate({
        id: selectedLocationId,
        status: "rejected",
        rejectionReason: reason,
      });
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ["admin-locations-stats"],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/admin/locations/stats",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const locations = data?.items || [];

  const stats = [
    { label: "Tổng địa điểm", value: statsData?.total || 0 },
    {
      label: filterProvince ? `Tại ${filterProvince}` : "Tại Đà Nẵng",
      value: filterProvince
        ? data?.pagination?.total || 0 // If filtered, use the list count
        : statsData?.daNang || 0, // Else use Da Nang count
    },
    { label: "Lượt check-in", value: statsData?.totalViews || 0 }, // Using views as proxy for check-ins
    {
      label: "Chờ duyệt",
      value: statsData?.pending || 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Rejection Modal */}
      <RejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Trang chủ / Quản lý địa điểm
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Quản lý địa điểm theo tỉnh thành
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Lọc và quản lý các địa danh du lịch theo từng khu vực tỉnh/thành
            phố.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/locations/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200"
          >
            <FaPlus /> Thêm địa điểm mới
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600 w-full md:w-auto">
            <FaSearch className="text-gray-400" />
            <input
              placeholder="Tìm tên địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full md:w-56"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 outline-none cursor-pointer border-none whitespace-nowrap"
            >
              <option value="">Tất cả tỉnh thành</option>
              {citiesData?.items?.map((c: City) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 outline-none cursor-pointer border-none whitespace-nowrap"
            >
              <option value="">Tất cả danh mục</option>
              <option value="Kỳ quan">Kỳ quan</option>
              <option value="Biển đảo">Biển đảo</option>
              <option value="Lịch sử">Lịch sử</option>
              <option value="Ẩm thực">Ẩm thực</option>
            </select>
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
          ) : locations.length > 0 ? (
            locations.map((loc: Location) => (
              <div
                key={loc._id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      {loc.imageUrl ? (
                        <Image
                          src={loc.imageUrl}
                          alt={loc.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="relative h-full w-full">
                          <Image
                            src="https://placehold.co/80x80"
                            alt={loc.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-gray-500">{loc.province}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      loc.status === "approved"
                        ? "bg-emerald-100 text-emerald-600"
                        : loc.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {loc.status === "approved"
                      ? "Hoạt động"
                      : loc.status === "rejected"
                        ? "Từ chối"
                        : "Chờ duyệt"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    {loc.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(loc._id)}
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                          title="Duyệt"
                          disabled={processingId === loc._id}
                        >
                          {processingId === loc._id &&
                          updateStatusMutation.isPending ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaCheck />
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectClick(loc._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Từ chối"
                          disabled={processingId === loc._id}
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                    <button
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      onClick={() => handleDelete(loc._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dia-diem/${loc._id}`}
                      target="_blank"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Xem
                    </Link>
                    <Link
                      href={`/admin/locations/${loc._id}`}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Sửa
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-500">
              Không tìm thấy địa điểm nào.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Tên địa điểm</th>
                <th className="px-4 py-3 text-left">Tỉnh thành</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-400" colSpan={5}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="px-4 py-6 text-red-500" colSpan={5}>
                    Có lỗi khi tải dữ liệu.
                  </td>
                </tr>
              ) : (
                locations.map((loc: Location) => (
                  <tr key={loc._id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          {loc.imageUrl ? (
                            <Image
                              src={loc.imageUrl}
                              alt={loc.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="relative h-full w-full">
                              <Image
                                src="https://placehold.co/80x80"
                                alt={loc.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {loc.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {loc._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{loc.province}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        {loc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          loc.status === "approved"
                            ? "bg-emerald-100 text-emerald-600"
                            : loc.status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {loc.status === "approved"
                          ? "Hoạt động"
                          : loc.status === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      <div className="flex justify-end gap-3">
                        {loc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(loc._id)}
                              className="hover:text-emerald-600 flex items-center disabled:opacity-50"
                              title="Duyệt"
                              disabled={processingId === loc._id}
                            >
                              {processingId === loc._id &&
                              updateStatusMutation.isPending ? (
                                <FaSpinner className="animate-spin text-emerald-600" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectClick(loc._id)}
                              className="hover:text-red-500 flex items-center"
                              title="Từ chối"
                              disabled={processingId === loc._id}
                            >
                              <FaTimes />
                            </button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                          </>
                        )}

                        <Link
                          href={`/dia-diem/${loc._id}`}
                          target="_blank"
                          className="hover:text-blue-600 flex items-center"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/locations/${loc._id}`}
                          className="hover:text-blue-600 flex items-center"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="hover:text-red-500"
                          onClick={() => handleDelete(loc._id)}
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
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Hiển thị {(page - 1) * 10 + 1}-
            {Math.min(page * 10, data?.pagination?.total || 0)} trong số{" "}
            {data?.pagination?.total || 0} địa điểm
          </span>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              {page}
            </button>
            <button
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <p className="text-xs text-gray-400 uppercase">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
