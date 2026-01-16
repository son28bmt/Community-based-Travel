"use client";

// Ensure UTF-8 encoding
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaEllipsisH,
  FaEye,
  FaFilter,
  FaPlus,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminCitiesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const placeholderImage = "https://placehold.co/600x400";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-cities", page, search, filterRegion],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/cities", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 8,
          search: search || undefined,
          status: "",
          region: filterRegion || undefined, // Backend now supports region filter
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`http://localhost:5000/api/admin/cities/${id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      toast.success("Đã xóa tỉnh/thành phố");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể xóa");
    },
  });

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tỉnh/thành phố này không? Hành động này không thể hoàn tác."
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Backend now handles filtering
  const cities = data?.items || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Dashboard / Quản lý địa phương
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Quản Lý Tỉnh / Thành Phố
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Hệ thống quản lý dữ liệu du lịch cấp tỉnh, cập nhật trạng thái hiển
            thị và quản lý các điểm đến đặc trưng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <FaEllipsisH /> Xuất báo cáo
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <FaFilter /> {filterRegion || "Lọc theo vùng"}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 hidden group-hover:block z-50">
              <div className="p-2 space-y-1">
                {[
                  "",
                  "Miền Bắc",
                  "Miền Trung",
                  "Miền Nam",
                  "Tây Nguyên",
                  "Miền Tây",
                ].map((region) => (
                  <button
                    key={region || "all"}
                    onClick={() => setFilterRegion(region)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterRegion === region ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                  >
                    {region || "Tất cả"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/admin/locations/cities/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200"
          >
            <FaPlus /> Thêm Tỉnh Mới
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm h-56 animate-pulse"
            ></div>
          ))
        ) : isError ? (
          <div className="col-span-full text-center text-red-500">
            Có lỗi khi tải dữ liệu.
          </div>
        ) : (
          cities.map((city: any) => (
            <div
              key={city._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="relative h-36">
                {brokenImages[city._id] || !city.imageUrl ? (
                  <img
                    src={placeholderImage}
                    alt={city.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={city.imageUrl}
                    alt={city.name}
                    fill
                    sizes="(max-width: 1200px) 100vw, 25vw"
                    className="object-cover"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [city._id]: true,
                      }))
                    }
                  />
                )}
                <span
                  className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full ${
                    city.status === "active"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {city.status === "active" ? "HOẠT ĐỘNG" : "ĐANG ẨN"}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900">{city.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{city.region}</span>
                  <span>{city.locationsCount || 0} địa điểm</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Link
                      href={`/admin/locations/cities/${city._id}`}
                      className="hover:text-blue-600"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      className="hover:text-red-500"
                      onClick={() => handleDelete(city._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Hiển thị</span>
                    <span className="w-10 h-5 rounded-full bg-blue-600 relative">
                      <span className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <Link
          href="/admin/locations/cities/new"
          className="border-2 border-dashed border-blue-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 hover:bg-blue-50/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <FaPlus />
          </div>
          <p className="font-semibold text-gray-700">Thêm Tỉnh Mới</p>
          <p className="text-xs text-gray-500 mt-1">Khai phá vùng đất mới</p>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">
          Danh sách chi tiết
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">Tỉnh/Thành phố</th>
              <th className="px-6 py-4 text-left">Vùng</th>
              <th className="px-6 py-4 text-left">Số địa điểm</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cities.slice(0, 5).map((city: any) => (
              <tr key={city._id}>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {city.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{city.region}</td>
                <td className="px-6 py-4 text-gray-500">
                  {city.locationsCount || 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      city.status === "active"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {city.status === "active" ? "HIỂN THỊ" : "ĐÃ ẨN"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/locations/cities/${city._id}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Quản lý
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 text-xs text-gray-400 flex items-center justify-between">
          <span>
            Hiển thị {(page - 1) * 8 + 1}-
            {Math.min(page * 8, data?.pagination?.total || 0)} của{" "}
            {data?.pagination?.total || 0} tỉnh thành
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-md text-gray-600 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <button
              className="px-3 py-1 border rounded-md text-gray-600 disabled:opacity-50"
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
