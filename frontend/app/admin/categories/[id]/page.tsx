"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  FaTrash,
} from "react-icons/fa";

export default function AdminCategoryEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "map",
    status: "active",
    parentId: "",
  });

  // Fetch category details
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["admin-category", id],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/admin/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      return res.data.category;
    },
    enabled: !!session?.user?.accessToken && !!id,
  });

  // Fetch all categories for parent selection
  const { data: allCategories } = useQuery({
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

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || "",
        description: categoryData.description || "",
        icon: categoryData.icon || "map",
        status: categoryData.status || "active",
        parentId: categoryData.parent || "",
      });
    }
  }, [categoryData]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, parentId: data.parentId || null };
      return axios.patch(
        `http://localhost:5000/api/admin/categories/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category", id] });
      toast.success("Đã cập nhật danh mục");
      router.push("/admin/categories");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Đã xóa danh mục");
      router.push("/admin/categories");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const icons = [
    { id: "map", icon: <FaMapMarkedAlt />, label: "Bản đồ" },
    { id: "utensils", icon: <FaUtensils />, label: "Ẩm thực" },
    { id: "hotel", icon: <FaHotel />, label: "Khách sạn" },
    { id: "camera", icon: <FaCamera />, label: "Chụp ảnh" },
    { id: "bed", icon: <FaBed />, label: "Nghỉ ngơi" },
    { id: "coffee", icon: <FaCoffee />, label: "Cafe" },
  ];

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>
    );

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
              Cập nhật danh mục
            </h1>
            <p className="text-gray-500 text-sm">
              Chỉnh sửa thông tin chi tiết.
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium flex items-center gap-2"
        >
          <FaTrash /> Xóa
        </button>
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
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Danh mục cha
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">Không có (Danh mục gốc)</option>
                {allCategories?.items?.map(
                  (cat: any) =>
                    // Prevent selecting self as parent (simple check)
                    cat._id !== id && (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    )
                )}
              </select>
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
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {updateMutation.isPending ? (
                "Đang lưu..."
              ) : (
                <>
                  <FaSave /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
