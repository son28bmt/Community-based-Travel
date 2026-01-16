"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FaUnderline,
} from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    if (editorRef.current.innerHTML !== value) {
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
    const url = window.prompt("D?n link ?nh");
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
          title="??m"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Nghi?ng"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="G?ch ch?n"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h2")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Ti?u ??"
        >
          <FaHeading />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyLeft")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="C?n tr?i"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyCenter")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="C?n gi?a"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyRight")}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="C?n ph?i"
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-blue-600"
          title="Ch?n ?nh"
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

export default function AdminLocationCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    category: "",
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
  });

  const [selectedParent, setSelectedParent] = useState("");

  const { data: parentCategories } = useQuery({
    queryKey: ["admin-parent-categories"],
    queryFn: async () => {
      // Fetch only parents (default behavior of public API now)
      const res = await axios.get("http://localhost:5000/api/categories");
      return res.data;
    },
  });

  const { data: subCategories } = useQuery({
    queryKey: ["admin-sub-categories", selectedParent],
    queryFn: async () => {
      if (!selectedParent) return { items: [] };
      const res = await axios.get("http://localhost:5000/api/categories", {
        params: { parent: selectedParent },
      });
      return res.data;
    },
    enabled: !!selectedParent,
  });

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
          imageUrl: updatedImages[0] || "", // Auto set first image as cover
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
      await axios.post("http://localhost:5000/api/admin/locations", formData, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      toast.success("Đã tạo địa điểm");
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-locations-stats"] });
      router.push("/admin/locations");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo");
    }
  };

  const cities = citiesData?.items || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Trang chủ / Quản lý địa điểm / Thêm địa điểm
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Thêm Địa Điểm Mới
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Tạo địa điểm mới để hiển thị cho người dùng khám phá.
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
              <div className="space-y-3 mt-2">
                {/* Parent Category Select */}
                <select
                  value={selectedParent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedParent(val);
                    setFormData((prev) => ({ ...prev, category: "" })); // Reset final category on parent change
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Chọn danh mục cha --</option>
                  {parentCategories?.items?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Sub Category Select */}
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  disabled={!selectedParent}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Chọn danh mục con --</option>
                  {subCategories?.items?.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
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
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors">
              <FaCloudUploadAlt className="text-2xl" />
              <span className="mt-2 text-sm font-semibold">
                {isUploading ? "Đang tải ảnh..." : "Kéo thả hoặc tải ảnh"}
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
                <span>Đang thuộc tỉnh Đà Nẵng</span>
              </div>
              <p className="text-xs text-gray-400">
                Sau khi tạo, địa điểm sẽ hiển thị theo tỉnh thành tương ứng.
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
          Tạo địa điểm
        </button>
      </div>
    </div>
  );
}
