"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaUtensils,
  FaHotel,
  FaMapMarkedAlt,
  FaCamera,
  FaBed,
  FaCoffee,
} from "react-icons/fa";

export default function AdminCategoryCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "map",
    status: "active",
    parentId: "",
  });

  // Fetch existing categories for Parent selection
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Clean up parentId if empty
      const payload = { ...data, parentId: data.parentId || undefined };
      return axios.post("http://localhost:5000/api/admin/categories", payload, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      toast.success("Đã tạo danh mục mới");
      router.push("/admin/categories");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi tạo danh mục");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const icons = [
    { id: "map", icon: <FaMapMarkedAlt />, label: "Bản đồ" },
    { id: "utensils", icon: <FaUtensils />, label: "Ẩm thực" },
    { id: "hotel", icon: <FaHotel />, label: "Khách sạn" },
    { id: "camera", icon: <FaCamera />, label: "Chụp ảnh" },
    { id: "bed", icon: <FaBed />, label: "Nghỉ ngơi" },
    { id: "coffee", icon: <FaCoffee />, label: "Cafe" },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/categories"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Thêm danh mục mới
            </h1>
            <p className="text-gray-500 text-sm">
              Tạo nhóm phân loại cho địa điểm.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                placeholder="Ví dụ: Di tích lịch sử"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Mô tả ngắn
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all min-h-[100px]"
                placeholder="Mô tả về danh mục này..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Danh mục cha (Tùy chọn)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">Không có (Danh mục gốc)</option>
                {categoriesData?.items?.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400">
                Chọn danh mục cha để tạo nhóm (Group).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Biểu tượng
              </label>
              <div className="flex flex-wrap gap-3">
                {icons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.id })}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${formData.icon === item.id ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 hover:border-blue-200 text-gray-400"}`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Trạng thái
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Hoạt động</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Link
              href="/admin/categories"
              className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {createMutation.isPending ? (
                "Đang xử lý..."
              ) : (
                <>
                  <FaSave /> Lưu danh mục
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
