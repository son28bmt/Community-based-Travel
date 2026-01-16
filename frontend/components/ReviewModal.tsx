"use client";

import { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  locationId,
}: ReviewModalProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadImages = async (files: FileList | null) => {
    if (!files || !session?.user?.accessToken) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
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
        uploadedUrls.push(res.data.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          locationId,
          rating,
          content,
          images,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đánh giá của bạn đã được gửi!");
      queryClient.invalidateQueries({
        queryKey: ["location-reviews", locationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["location-detail", locationId],
      });
      onClose();
      setContent("");
      setRating(5);
      setImages([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gửi đánh giá thất bại");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Viết đánh giá</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-gray-600 mb-2 font-medium">
              Bạn cảm thấy thế nào?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl focus:outline-none transition-transform hover:scale-110"
                >
                  <FaStar
                    className={`${
                      star <= (hoverRating || rating)
                        ? "text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-amber-500 font-bold mt-2 text-sm">
              {rating === 5 && "Tuyệt vời!"}
              {rating === 4 && "Rất tốt"}
              {rating === 3 && "Bình thường"}
              {rating === 2 && "Tệ"}
              {rating === 1 && "Rất tệ"}
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
            className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          ></textarea>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Hình ảnh đánh giá (tối đa 5)
              </p>
              <label className="text-xs text-blue-600 font-semibold cursor-pointer">
                Tải lên
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadImages(e.target.files)}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading ? (
              <p className="text-xs text-gray-400">Đang tải...</p>
            ) : null}
            {images.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, idx) => (
                  <div
                    key={url}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`review-${idx}`}
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
            ) : (
              <p className="text-xs text-gray-400">Chưa có ảnh nào.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !content.trim() || isUploading}
              className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {mutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
