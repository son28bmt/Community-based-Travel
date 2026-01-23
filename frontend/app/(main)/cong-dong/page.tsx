"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  FaComment,
  FaHeart,
  FaUserCircle,
  FaFire,
  FaPlus,
} from "react-icons/fa";
import CreatePostModal from "@/components/CreatePostModal";

const CATEGORY_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Review", value: "Review" },
  { label: "Hỏi đáp", value: "Question" },
  { label: "Mẹo hay", value: "Tips" },
  { label: "Chia sẻ", value: "General" },
];

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const stripHtml = (html: string) => {
  if (!html) return "";
  // Remove tags
  let text = html.replace(/<[^>]*>?/gm, "");
  // Decode basic entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  return text.trim();
};

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["community-posts", page, category],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/posts",
        {
          params: { page, limit: 6, category: category || undefined },
        },
      );
      return res.data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: () => {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
      router.push("/login"); // Optional: redirect to login
    },
  });

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!session) {
      toast.error("Vui lòng đăng nhập để thả tim!");
      router.push("/login");
      return;
    }
    likeMutation.mutate(postId);
  };

  const posts = data?.items || [];
  const pagination = data?.pagination;

  const trending = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [posts]);

  const handleOpenCreate = () => {
    // @ts-ignore
    if (!session?.user?.accessToken) {
      toast.error("Vui lòng đăng nhập để đăng bài.");
      router.push("/login");
      return;
    }
    setIsCreateOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Chuyên mục</h3>
              <ul className="space-y-2">
                {CATEGORY_OPTIONS.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(item.value);
                        setPage(1);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition ${
                        category === item.value
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Feed */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* New Post Input */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <FaUserCircle size={24} />
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="w-full text-left bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm mb-3 text-gray-500"
                >
                  Bạn muốn chia sẻ điều gì?
                </button>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-gray-500 px-2 py-1 rounded">
                      Ảnh/Video
                    </span>
                    <span className="text-xs font-medium text-gray-500 px-2 py-1 rounded">
                      Cảm xúc
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-600 flex items-center gap-1"
                  >
                    <FaPlus /> Đăng bài
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs (Mobile) */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
              {CATEGORY_OPTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setCategory(item.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                    category === item.value
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-gray-500">
                Đang tải bài viết...
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-gray-500">
                Chưa có bài viết nào.
              </div>
            ) : (
              posts.map((post: any) => {
                // @ts-ignore
                const isLiked = post.likes?.includes(session?.user?.id);
                const likeCount = post.likes?.length || 0;

                return (
                  <div
                    key={post._id}
                    className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
                    onClick={() => router.push(`/bai-viet/${post._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                        {post.createdBy?.avatar ? (
                          <Image
                            src={post.createdBy.avatar}
                            alt={post.createdBy?.name || "User"}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <FaUserCircle className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {post.createdBy?.name || "Ẩn danh"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {stripHtml(post.content)}
                    </p>
                    {stripHtml(post.content).length > 200 && (
                      <span className="text-blue-500 text-sm font-medium mb-4 block hover:underline">
                        Xem chi tiết
                      </span>
                    )}

                    {post.imageUrl && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex gap-2 mb-4">
                      {post.category && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                          #{post.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-gray-500">
                      <button
                        className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-500" : "hover:text-red-500"}`}
                        onClick={(e) => handleLike(e, post._id)}
                      >
                        <FaHeart /> <span>{likeCount}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <FaComment /> <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span className="text-sm text-gray-500">
                  Trang {page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  disabled={page >= pagination.totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" /> Chủ đề nóng
              </h3>
              <ul className="space-y-4">
                {trending.length === 0 ? (
                  <li className="text-sm text-gray-500">Chưa có dữ liệu.</li>
                ) : (
                  trending.map((post: any, index: number) => (
                    <li key={post._id} className="flex gap-3">
                      <span className="font-bold text-gray-300 text-xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {post.views || 0} lượt xem
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-blue-500 p-6 rounded-xl text-white text-center">
              <h3 className="font-bold text-lg mb-2">
                Trở thành Local Expert?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Chia sẻ kiến thức du lịch và nhận huy hiệu từ cộng đồng.
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50">
                Tham gia ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
