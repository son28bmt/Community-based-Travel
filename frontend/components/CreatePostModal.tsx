"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaTimes, FaSpinner, FaImage } from "react-icons/fa";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      return res.data.url;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/posts", data, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Bài viết đã được tạo thành công!");
      onClose();
      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    let imageUrl = "";
    if (image) {
      try {
        imageUrl = await uploadMutation.mutateAsync(image);
      } catch (err) {
        toast.error("Lỗi upload ảnh");
        return;
      }
    }

    createMutation.mutate({
      title,
      content,
      category,
      imageUrl,
      status: "published", // Default to published for now
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Tạo bài viết mới</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ảnh bìa
            </label>
            <div className="relative w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition overflow-hidden">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center text-gray-500">
                  <FaImage className="text-3xl mx-auto mb-2" />
                  <span className="text-sm">Nhấn để chọn ảnh</span>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {preview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500 z-10"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Tiêu đề
            </label>
            <input
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold text-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Danh mục
            </label>
            <select
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">chia sẻ</option>
              <option value="Review">Review</option>
              <option value="Tips">mẹo</option>
              <option value="Question">Hỏiđáp</option>
            </select>
          </div>

          <div className="flex-1 min-h-[300px] flex flex-col">
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Nội dung
            </label>
            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-200">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-full"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [
                      { list: "ordered" },
                      { list: "bullet" },
                      { indent: "-1" },
                      { indent: "+1" },
                    ],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || uploadMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {(createMutation.isPending || uploadMutation.isPending) && (
              <FaSpinner className="animate-spin" />
            )}
            Đăng bài
          </button>
        </div>
      </div>
    </div>
  );
}
