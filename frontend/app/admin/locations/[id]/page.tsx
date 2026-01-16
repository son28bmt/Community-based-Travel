"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaArrowLeft,
  FaBold,
  FaCloudUploadAlt,
  FaHeading,
  FaImage,
  FaItalic,
  FaMapMarkerAlt,
  FaSpinner,
  FaUnderline,
} from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML != value) {
      editorRef.current.innerHTML = value || "<p></p>";
    }
  }, [value]);

  const exec = (command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    const url = window.prompt("Dan link anh");
    if (url) {
      exec("insertImage", url);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Dam"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Nghieng"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Gach chan"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h2")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Tieu de"
        >
          <FaHeading />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyLeft")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Can trai"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyCenter")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Can giua"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyRight")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Can phai"
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Chen anh"
        >
          <FaImage />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[180px] px-4 py-3 text-sm text-gray-700 outline-none"
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        suppressContentEditableWarning
      ></div>
    </div>
  );
};

export default function AdminLocationEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    category: "Kỳ quan",
    description: "",
    imageUrl: "",
    images: [] as string[],
    status: "approved",
  });

  const { data: citiesData } = useQuery({
    queryKey: ["admin-cities-select"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/cities", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: { page: 1, limit: 100 },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
    enabled: !!session?.user?.accessToken,
  });

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

  useEffect(() => {
    if (session?.user?.accessToken && id) {
      fetchLocation();
    }
  }, [session, id]);

  const fetchLocation = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/locations/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      const location = res.data.location;
      setFormData({
        name: location.name,
        province: location.province,
        category: location.category,
        description: location.description || "",
        imageUrl: location.imageUrl || "",
        images:
          location.images || (location.imageUrl ? [location.imageUrl] : []),
        status: location.status,
      });
    } catch (error) {
      toast.error("Không thể tải thông tin địa điểm");
      router.push("/admin/locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append("file", file);

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
        newImages.push(res.data.url);
      }

      setFormData((prev) => {
        const updatedImages = [...prev.images, ...newImages];
        return {
          ...prev,
          images: updatedImages,
          imageUrl: updatedImages[0] || "", // Auto set cover to first image
        };
      });
      toast.success("Tải ảnh thành công");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter(
        (_, idx) => idx !== indexToRemove
      );
      return {
        ...prev,
        images: updatedImages,
        imageUrl: updatedImages[0] || "",
      };
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/locations/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      toast.success("Đã cập nhật địa điểm");
      router.push("/admin/locations");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật");
    }
  };

  const cities = citiesData?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Trang chủ / Quản lý địa điểm / Sửa địa điểm
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Cập Nhật Địa Điểm
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Chỉnh sửa thông tin địa điểm và cập nhật trạng thái hiển thị.
          </p>
        </div>
        <Link
          href="/admin/locations"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft /> Quay lại
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Tên địa điểm
            </label>
            <input
              placeholder="Ví dụ: Bãi biển Mỹ Khê"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tỉnh/Thành phố
              </label>
              <select
                value={formData.province}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, province: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {cities.map((city: any) => (
                  <option key={city._id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- Chọn danh mục --</option>
                {categoriesData?.items?.map((cat: any) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Địa chỉ
              </label>
              <input
                placeholder="Ví dụ: Q. Sơn Trà, Đà Nẵng"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="approved">Hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Mô tả địa điểm
            </label>
            <div className="mt-2">
              <RichTextEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Tiện ích
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Bãi đỗ xe", "Hướng dẫn viên", "Nhà hàng", "Wifi"].map(
                (item) => (
                  <button
                    key={item}
                    className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Hình ảnh ({formData.images.length}/5)
            </h3>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors">
              <FaCloudUploadAlt className="text-2xl" />
              <span className="mt-2 text-sm font-semibold">
                {isUploading ? "Đang tải ảnh..." : "Tải thêm ảnh"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleUploadImage}
                disabled={isUploading || formData.images.length >= 5}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-24 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <Image
                    src={img}
                    alt={`Preview ${idx}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeImage(idx)}
                      className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Thông tin nhanh
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>Đã có dữ liệu xác thực</span>
              </div>
              <p className="text-xs text-gray-400">
                Lưu ý: Thay đổi danh mục có thể ảnh hưởng đến kết quả tìm kiếm.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/admin/locations")}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
