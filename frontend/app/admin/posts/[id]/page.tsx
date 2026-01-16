"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaSpinner,
  FaBold,
  FaItalic,
  FaUnderline,
  FaHeading,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaImage,
} from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    const url = window.prompt("Nhập đường dẫn ảnh (URL):");
    if (url) {
      exec("insertImage", url);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="In đậm"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="In nghiêng"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Gạch chân"
        >
          <FaUnderline />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h2")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Tiêu đề"
        >
          <FaHeading />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyLeft")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Căn trái"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyCenter")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Căn giữa"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyRight")}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Căn phải"
        >
          <FaAlignRight />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={insertImage}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600"
          title="Chèn ảnh"
        >
          <FaImage />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] px-4 py-3 text-sm text-gray-700 outline-none prosemirror-editor"
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default function AdminPostEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "pending",
    content: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  // Fetch post details
  const { data: postData, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/admin/posts/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      return res.data.post;
    },
    enabled: !!session?.user?.accessToken && !!id,
  });

  // Fetch categories
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
    if (postData) {
      setFormData({
        title: postData.title || "",
        category: postData.category || "",
        status: postData.status || "pending",
        content: postData.content || "",
        imageUrl: postData.imageUrl || "",
      });
    }
  }, [postData]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return axios.patch(`http://localhost:5000/api/admin/posts/${id}`, data, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
      toast.success("Đã cập nhật bài viết");
      router.push("/admin/posts");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Đang tải ảnh...");
    setUploading(true);

    try {
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

      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      toast.success("Tải ảnh thành công", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">Đang tải bài viết...</div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Cập nhật bài viết
            </h1>
            <p className="text-sm text-gray-500">Chỉnh sửa nội dung bài viết</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateMutation.isPending && <FaSpinner className="animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Nội dung bài viết
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, content: val }))
                }
              />
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin chung
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 bg-gray-50"
                >
                  <option value="pending">Chờ duyệt</option>
                  <option value="published">Công khai</option>
                  <option value="draft">Bản nháp</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chuyên mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 bg-gray-50"
                >
                  <option value="">-- Chọn chuyên mục --</option>
                  {categoriesData?.items?.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ảnh bìa</h2>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
              {formData.imageUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={formData.imageUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        document.getElementById("cover-upload")?.click()
                      }
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600"
                    >
                      <FaCloudUploadAlt />
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    document.getElementById("cover-upload")?.click()
                  }
                  className="cursor-pointer py-8"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    {uploading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaImage />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Nhấn để tải ảnh lên
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF (Max 5MB)
                  </p>
                </div>
              )}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
