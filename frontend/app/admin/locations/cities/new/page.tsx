"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCloudUploadAlt, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminCityCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    region: "Miền Bắc",
    description: "",
    imageUrl: "",
    status: "active",
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
      toast.success("Tải ảnh thành công");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/admin/cities", formData, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      toast.success("Đã tạo tỉnh/thành phố");
      router.push("/admin/locations/cities");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Dashboard / Quản lý địa phương / Thêm tỉnh thành
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Thêm Tỉnh / Thành Phố
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Tạo mới tỉnh thành để quản lý điểm đến theo khu vực.
          </p>
        </div>
        <Link
          href="/admin/locations/cities"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft /> Quay lại
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tên tỉnh/thành phố
              </label>
              <input
                placeholder="Ví dụ: Đà Nẵng"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Vùng miền
              </label>
              <select
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, region: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option>Miền Bắc</option>
                <option>Miền Trung</option>
                <option>Miền Nam</option>
                <option>Tây Nguyên</option>
                <option>Miền Tây</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Mô tả ngắn
            </label>
            <textarea
              rows={4}
              placeholder="Giới thiệu điểm nhấn du lịch, văn hóa..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Trạng thái hiển thị
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "active" }))
                }
                className={`px-4 py-2 rounded-full text-xs font-semibold ${
                  formData.status === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "hidden" }))
                }
                className={`px-4 py-2 rounded-full text-xs font-semibold ${
                  formData.status === "hidden"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Ẩn
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Hình ảnh</h3>
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer text-gray-500 hover:bg-gray-50">
              <FaCloudUploadAlt className="text-2xl" />
              <span className="mt-2 text-sm font-semibold">
                {isUploading ? "Đang tải ảnh..." : "Tải ảnh đại diện"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={isUploading}
              />
            </label>
            {formData.imageUrl ? (
              <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden border border-gray-200 group">
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">
                    Đổi ảnh khác
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Thống kê nhanh
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>0 địa điểm được liên kết</span>
              </div>
              <p className="text-xs text-gray-400">
                Sau khi tạo tỉnh/thành phố, bạn có thể thêm địa điểm vào khu vực
                này.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Lưu nháp
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200"
        >
          Tạo tỉnh/thành phố
        </button>
      </div>
    </div>
  );
}
