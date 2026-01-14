"use client";

import { useState, useEffect } from "react";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaSpinner,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLocationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // empty = all
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Thiên nhiên",
    province: "",
    description: "",
    imageUrl: "",
    status: "pending",
  });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/uploads",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Locations
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-locations", page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/locations", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newLocation: any) => {
      return axios.post(
        "http://localhost:5000/api/admin/locations",
        newLocation,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Thêm địa điểm thành công!");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/locations/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Cập nhật thành công!");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`http://localhost:5000/api/admin/locations/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Đã xóa địa điểm!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  // Handlers
  const handleOpenModal = (location: any = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        category: location.category,
        province: location.province,
        description: location.description || "",
        imageUrl: location.imageUrl || "",
        status: location.status,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        category: "Thiên nhiên",
        province: "",
        description: "",
        imageUrl: "",
        status: "pending",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            ● Đã duyệt
          </span>
        );
      case "pending":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            ● Chờ duyệt
          </span>
        );
      case "hidden":
        return (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
            ● Bị ẩn
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý địa điểm</h1>
          <p className="text-gray-500">
            Hệ thống phê duyệt và quản lý các điểm đến du lịch.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
        >
          <FaPlus /> Thêm địa điểm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
          {["", "pending", "approved", "hidden"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                statusFilter === st
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {st === ""
                ? "Tất cả"
                : st === "pending"
                  ? "Chờ duyệt"
                  : st === "approved"
                    ? "Đã duyệt"
                    : "Bị ẩn"}
            </button>
          ))}
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading || !data ? (
          <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-2xl" /> Đang tải dữ liệu...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>Không tìm thấy địa điểm nào.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Tên địa điểm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Tỉnh/Thành</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((loc: any) => (
                  <tr
                    key={loc._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden relative">
                          {loc.imageUrl ? (
                            <Image
                              src={loc.imageUrl}
                              alt={loc.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                              ?
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {loc.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            ID: {loc._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                        {loc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{loc.province}</td>
                    <td className="px-6 py-4">{getStatusBadge(loc.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-gray-400">
                        {loc.status === "pending" && (
                          <button
                            onClick={() => {
                              setEditingLocation(loc);
                              setFormData({ ...loc, status: "approved" }); // Quick approve hook, or just open edit
                              updateMutation.mutate({
                                id: loc._id,
                                data: { status: "approved" },
                              });
                            }}
                            className="text-green-600 hover:text-green-700 font-bold text-xs border border-green-200 bg-green-50 px-2 py-1 rounded"
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(loc)}
                          className="hover:text-blue-500 p-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
                          className="hover:text-red-500 p-1"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span>
                Trang {data.pagination.page} / {data.pagination.totalPages}
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
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingLocation ? "Chỉnh sửa địa điểm" : "Thêm mới địa điểm"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên địa điểm
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Nhập tên địa điểm..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="Thiên nhiên">Thiên nhiên</option>
                      <option value="Văn hóa">Văn hóa</option>
                      <option value="Ẩm thực">Ẩm thực</option>
                      <option value="Giải trí">Giải trí</option>
                      <option value="Khách sạn">Khách sạn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Tỉnh / Thành
                    </label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="VD: Hà Nội"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Hình ảnh
                  </label>

                  {formData.imageUrl ? (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, imageUrl: "" })
                          }
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <FaSpinner className="animate-spin text-gray-500 text-2xl" />
                              <p className="text-sm text-gray-500 font-bold">
                                Đang tải lên...
                              </p>
                            </div>
                          ) : (
                            <>
                              <FaCloudUploadAlt className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500 font-bold">
                                Nhấp để tải ảnh lên
                              </p>
                              <p className="text-xs text-gray-400">
                                SVG, PNG, JPG (MAX. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={handleUploadImage}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Mô tả ngắn về địa điểm..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt (Public)</option>
                    <option value="hidden">Ẩn (Private)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Đang lưu..."
                      : "Lưu địa điểm"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
