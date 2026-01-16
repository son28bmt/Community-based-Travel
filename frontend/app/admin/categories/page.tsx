"use client";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaEllipsisV,
  FaUtensils,
  FaHotel,
  FaMapMarkedAlt,
  FaCamera,
  FaBed,
  FaCoffee,
} from "react-icons/fa";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useState } from "react";

const iconMap: Record<string, JSX.Element> = {
  utensils: <FaUtensils className="text-blue-500" />,
  hotel: <FaHotel className="text-blue-500" />,
  map: <FaMapMarkedAlt className="text-blue-500" />,
  camera: <FaCamera className="text-blue-500" />,
  bed: <FaBed className="text-blue-500" />,
  coffee: <FaCoffee className="text-blue-500" />,
};

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-categories", search],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/categories",
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
          params: { search: search || undefined },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Đã xóa danh mục");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/categories/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  const categories = data?.items || [];

  const resolveIcon = (icon: string) => {
    if (!icon) return <FaMapMarkedAlt className="text-blue-500" />;
    return iconMap[icon] || <FaMapMarkedAlt className="text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 px-4">
          Quản lý danh mục
        </h1>
        <div className="flex-1 max-w-xl mx-8 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link
          href="/admin/categories/new"
          className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <FaPlus /> Thêm danh mục
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Cấu trúc danh mục
          </h2>
          <p className="text-gray-500 mb-8">
            Quản lý danh mục cha và các danh mục con cho nền tảng du lịch.
          </p>

          {/* ...Toolbar... */}
          <div className="flex items-center gap-8 mb-6 text-sm font-medium text-gray-500">
            <Link
              href="/admin/categories/new"
              className="w-16 h-16 rounded-full bg-blue-50 border border-dashed border-blue-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <FaPlus className="text-blue-500" />
              <span className="text-[10px] text-blue-600">Thêm mới</span>
            </Link>
            {/* ... other non-functional buttons for now ... */}
          </div>

          {isLoading ? (
            <div className="text-gray-400">Đang tải danh mục...</div>
          ) : isError ? (
            <div className="text-red-500">Lỗi khi tải danh mục.</div>
          ) : categories.length === 0 ? (
            <div className="text-gray-400">Chưa có danh mục nào.</div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat: any) => (
                <div
                  key={cat._id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <div className="bg-white p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="text-gray-300 cursor-move">::</span>
                    <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                      {resolveIcon(cat.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {cat.name}{" "}
                        {cat.parent && (
                          <span className="text-xs text-gray-400">(Con)</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {cat.description || "Chưa có mô tả"} •{" "}
                        {(cat.subCategories || []).length} danh mục con,{" "}
                        {cat.locationCount || 0} địa điểm
                      </p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/categories/${cat._id}`}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FaEdit className="text-gray-600" />
                      </Link>
                      <button
                        className="p-2 hover:bg-red-50 rounded-full"
                        onClick={() => deleteMutation.mutate(cat._id)}
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {(cat.subCategories || []).length > 0 && (
                    <div className="bg-gray-50 p-4 pl-16 space-y-2 border-t border-gray-100">
                      {(cat.subCategories || []).map((sub: any) => (
                        <div
                          key={sub._id}
                          className="flex items-center gap-4 py-2 px-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all group"
                        >
                          <span className="text-gray-300 cursor-move text-xs">
                            ::
                          </span>
                          <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                          <span className="font-medium text-gray-700 flex-1">
                            {sub.name}
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/categories/${sub._id}`}
                              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 group-hover:text-gray-600"
                            >
                              <FaEdit size={12} />
                            </Link>
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 group-hover:text-gray-600"
                              onClick={() => deleteMutation.mutate(sub._id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
