"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaShare,
  FaUserCircle,
  FaRegHeart,
  FaFacebook,
  FaFacebookMessenger,
  FaLink,
  FaBookmark,
  FaMapMarkerAlt,
  FaPlus,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatDateTime = (value?: string) => {
  if (!value) return "Vừa xong";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const postId = params.id as string;

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/posts/${postId}`);
      return res.data;
    },
  });

  const { data: popularPosts } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/posts?limit=5`);
      return res.data.items;
    },
  });

  // Fetch author profile to check follow status
  const authorId = post?.createdBy?._id;
  const { data: authorProfile } = useQuery({
    queryKey: ["author-profile", authorId, session?.user?.accessToken],
    queryFn: async () => {
      const config: any = {};
      if (session?.user?.accessToken) {
        config.headers = {
          Authorization: `Bearer ${session.user.accessToken}`,
        };
      }
      const res = await axios.get(`${API_URL}/api/users/${authorId}`, config);
      return res.data;
    },
    enabled: !!authorId,
  });

  const isFollowingAuthor = authorProfile?.user?.isFollowing || false;

  const likeMutation = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.put(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["post", postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likes: data.likes,
        };
      });
    },
    onError: () => {
      toast.error("Vui lòng đăng nhập để thả tim");
      // router.push("/login"); // Optional: redirect to login
    },
  });

  const followMutation = useMutation({
    mutationFn: async (authorId: string) => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.put(
        `${API_URL}/api/users/${authorId}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onMutate: async (authorId: string) => {
      const queryKey = ["author-profile", authorId, session?.user?.accessToken];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.user) return oldData;
        return {
          ...oldData,
          user: {
            ...oldData.user,
            isFollowing: !oldData.user.isFollowing,
          },
        };
      });
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.error("Vui lòng đăng nhập để theo dõi");
    },
    onSuccess: (data, authorId) => {
      const queryKey = ["author-profile", authorId, session?.user?.accessToken];
      if (data?.isFollowing !== undefined) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData?.user) return oldData;
          return {
            ...oldData,
            user: {
              ...oldData.user,
              isFollowing: data.isFollowing,
            },
          };
        });
      }
      toast.success("Đã cập nhật theo dõi!");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 animate-pulse">Đang tải bài viết...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FaArrowLeft className="text-gray-400 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Không tìm thấy bài viết
        </h2>
        <p className="mb-6 max-w-md">
          Bài viết này có thể đã bị xóa hoặc không còn tồn tại trên hệ thống.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200"
        >
          Quay lại trang trước
        </button>
      </div>
    );
  }

  // @ts-ignore
  const isLiked = post.likes?.includes(session?.user?.id);
  const likeCount = post.likes?.length || 0;
  // @ts-ignore
  const isMe = session?.user?.id === post.createdBy?._id;

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb - Mobile Optimized */}
        <nav
          className="text-sm text-gray-500 mb-4 md:mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href="/cong-dong"
            className="hover:text-blue-600 transition-colors"
          >
            Cộng đồng
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Post Header Info */}
              <div className="p-4 md:p-8 md:pb-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Link
                      href={`/thanh-vien/${post.createdBy?._id}`}
                      className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 hover:ring-2 hover:ring-blue-100 transition-all"
                    >
                      {post.createdBy?.avatar ? (
                        <Image
                          src={post.createdBy.avatar}
                          alt={post.createdBy.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                          <FaUserCircle size={24} />
                        </div>
                      )}
                    </Link>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/thanh-vien/${post.createdBy?._id}`}
                          className="font-bold text-gray-900 text-sm md:text-base hover:text-blue-600 transition"
                        >
                          {post.createdBy?.name || "Người dùng ẩn danh"}
                        </Link>

                        {post.createdBy?.role === "admin" ? (
                          <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-red-100 flex items-center gap-1">
                            <FaCheckCircle size={10} /> Quản trị viên
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-green-100">
                            Thành viên
                          </span>
                        )}
                      </div>
                      <time
                        className="text-xs text-gray-500 mt-0.5 block"
                        dateTime={post.createdAt}
                      >
                        {formatDateTime(post.createdAt)}
                      </time>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => followMutation.mutate(post.createdBy?._id)}
                      disabled={followMutation.isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95 ${
                        isFollowingAuthor
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                      }`}
                    >
                      {isFollowingAuthor ? (
                        <>
                          <FaCheckCircle className="text-sm" />{" "}
                          <span className="hidden sm:inline">
                            Đang theo dõi
                          </span>
                          <span className="sm:hidden">Theo dõi</span>
                        </>
                      ) : (
                        <>
                          <FaPlus className="text-sm" /> Theo dõi
                        </>
                      )}
                    </button>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {post.title}
                </h1>
              </div>

              {/* Header Image */}
              {post.imageUrl && (
                <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] bg-gray-100">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                    unoptimized={!post.imageUrl.startsWith("/")}
                  />
                </div>
              )}

              <div className="p-4 md:p-8">
                {/* Content */}
                <div
                  className="prose prose-lg md:prose-xl max-w-none text-gray-700 mb-8 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Interactions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center w-full sm:w-auto gap-3">
                    <button
                      onClick={() => likeMutation.mutate()}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all flex-1 sm:flex-none justify-center group ${
                        isLiked
                          ? "bg-red-50 text-red-600 font-bold border border-red-100"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 font-medium"
                      }`}
                      aria-label={isLiked ? "Bỏ thích" : "Thích bài viết"}
                    >
                      {isLiked ? (
                        <FaHeart className="text-xl group-active:scale-125 transition-transform" />
                      ) : (
                        <FaRegHeart className="text-xl group-active:scale-125 transition-transform" />
                      )}
                      <span>{likeCount}</span>
                    </button>

                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all font-medium flex-1 sm:flex-none justify-center group">
                      <FaComment className="text-xl group-hover:text-blue-600 transition-colors" />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      aria-label="Share on Facebook"
                    >
                      <FaFacebook size={20} />
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      aria-label="Share on Messenger"
                    >
                      <FaFacebookMessenger size={20} />
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-bold"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Đã sao chép liên kết");
                      }}
                    >
                      <FaLink />{" "}
                      <span className="hidden sm:inline">Sao chép</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <CommentSection postId={postId} />
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Right Column */}
          <aside className="lg:col-span-4 space-y-6 md:space-y-8">
            {/* Related Location Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 top-24">
              <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                Địa điểm liên quan
              </h3>
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-gray-100 group cursor-pointer">
                {/* This should be dynamic based on post location data if available */}
                <Image
                  src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop"
                  alt="Map placeholder"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h4 className="font-bold text-lg leading-tight">
                      Đỉnh Tà Xùa
                    </h4>
                    <p className="text-xs text-gray-200 opacity-80">
                      Bắc Yên, Sơn La
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  <FaPaperPlane /> Chỉ đường
                </button>
                <button
                  className="w-12 flex items-center justify-center bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition"
                  aria-label="Lưu địa điểm"
                >
                  <FaBookmark />
                </button>
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
                Bài viết nổi bật
              </h3>
              <div className="space-y-4">
                {popularPosts?.map((p: any) => (
                  <Link
                    href={`/bai-viet/${p._id}`}
                    key={p._id}
                    className="flex gap-4 group items-start"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-500"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition leading-snug">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>
                          {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span>•</span>
                        <span>{p.views || 0} xem</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
