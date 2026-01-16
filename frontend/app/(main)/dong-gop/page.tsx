"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  FaCloudUploadAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaRegClock,
  FaRegCheckCircle,
} from "react-icons/fa";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type City = { _id: string; name: string };
type Category = { _id: string; name: string };

export default function ContributionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    province: "",
    category: "",
    subCategory: "",
    description: "",
    address: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Vui lòng đăng nhập để đóng góp.");
    }
  }, [status]);

  const { data: citiesData } = useQuery({
    queryKey: ["contribution-cities"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/cities", {
        params: { limit: 200, page: 1 },
      });
      return res.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["contribution-categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/categories");
      return res.data;
    },
  });

  // Fetch sub-categories based on selected main category
  const selectedCategory = categoriesData?.items?.find(
    (c: Category) => c.name === form.category
  );

  const { data: subCategoriesData } = useQuery({
    queryKey: ["contribution-subcategories", selectedCategory?._id],
    queryFn: async () => {
      if (!selectedCategory?._id) return { items: [] };
      const res = await axios.get("http://localhost:5000/api/categories", {
        params: { parent: selectedCategory._id },
      });
      return res.data;
    },
    enabled: !!selectedCategory?._id,
  });

  const handleUploadImage = async (files: FileList | null) => {
    if (!files || !session?.user?.accessToken) return;
    if (images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setIsUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post(
          "http://localhost:5000/api/uploads",
          formData,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );
        uploaded.push(res.data.url);
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 5));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const submitContribution = async (status: "pending" | "hidden") => {
    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để đóng góp.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/contributions/locations",
        {
          ...form,
          images,
          imageUrl: images[0] || "",
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );
      toast.success(
        status === "hidden" ? "Đã lưu bản nháp" : "Đã gửi đóng góp thành công"
      );
      router.push("/kham-pha");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gửi thất bại");
    }
  };

  const cities: City[] = citiesData?.items || [];
  const categories: Category[] = categoriesData?.items || [];
  const subCategories: Category[] = subCategoriesData?.items || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-gray-400 mb-3">
          Trang chủ / Đóng góp / Thêm địa điểm mới
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Thêm địa điểm mới
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Chia sẻ địa điểm mới với cộng đồng du lịch để mọi người cùng khám phá.
        </p>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-blue-600 font-semibold">
            <FaCheckCircle /> Bản nháp
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <FaRegClock /> Chờ duyệt
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <FaRegCheckCircle /> Đã duyệt
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tên địa điểm *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Bà Nà Hills, Hồ Hoàn Kiếm..."
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Tỉnh / Thành phố *
                </label>
                <select
                  value={form.province}
                  onChange={(e) =>
                    setForm({ ...form, province: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Danh mục chính *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      category: e.target.value,
                      subCategory: "",
                    }); // Reset subCategory
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Danh mục phụ (tùy chọn)
              </label>
              <select
                value={form.subCategory}
                onChange={(e) =>
                  setForm({ ...form, subCategory: e.target.value })
                }
                disabled={!form.category || subCategories.length === 0}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Chọn danh mục phụ</option>
                {subCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Địa chỉ (tùy chọn)
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ví dụ: Sơn Trà, Đà Nẵng"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Mô tả chi tiết *
              </label>
              <div className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => setForm({ ...form, description: value })}
                  placeholder="Chia sẻ các mẹo hữu ích, giờ mở cửa, giá vé..."
                  className="h-64 mb-12"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tối thiểu 100 ký tự để được duyệt nhanh hơn.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">
                Hình ảnh ({images.length}/5)
              </h3>
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors">
                <FaCloudUploadAlt className="text-2xl" />
                <span className="mt-2 text-sm font-semibold">
                  {isUploading ? "Đang tải lên..." : "Nhấn để tải lên"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleUploadImage(e.target.files)}
                  disabled={isUploading || images.length >= 5}
                />
              </label>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((url, idx) => (
                  <div
                    key={url}
                    className="relative h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`upload-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) =>
                          prev.filter((_, index) => index !== idx)
                        )
                      }
                      className="absolute top-1 right-1 bg-white/80 text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-sm font-bold text-blue-800 mb-3">
                Mẹo đóng góp
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>Sử dụng ảnh thực tế để được duyệt nhanh hơn.</li>
                <li>Cung cấp giờ mở cửa và giá cả rõ ràng nếu có thể.</li>
                <li>Mô tả cách đi lại và những điều nên mong đợi.</li>
                <li>Tôn trọng văn hóa địa phương và môi trường.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 mt-8 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" /> Đã bật tự động lưu
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => submitContribution("hidden")}
              className="px-5 py-2 rounded-full border border-blue-200 text-blue-600 font-semibold text-sm"
            >
              Lưu nháp
            </button>
            <button
              onClick={() => submitContribution("pending")}
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-200"
            >
              Gửi xét duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
