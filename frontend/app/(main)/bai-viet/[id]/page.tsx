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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/${postId}`);
      return res.data;
    },
  });

  const { data: popularPosts } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const res = await axios.get((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/posts?limit=5");
      return res.data.items;
    },
  });

  // Fetch author profile to check follow status
  const authorId = post?.createdBy?._id;
  const { data: authorProfile } = useQuery({
    queryKey: ["author-profile", authorId, session?.user?.accessToken],
    queryFn: async () => {
      const config = {};
      // @ts-ignore
      if (session?.user?.accessToken) {
        // @ts-ignore
        config.headers = {
          Authorization: `Bearer ${session.user.accessToken}`,
        };
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/users/${authorId}`,
        config
      );
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
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      router.push("/login");
    },
  });

  const followMutation = useMutation({
    mutationFn: async (authorId: string) => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/users/${authorId}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-gray-500">
        <p className="mb-4">Không tìm thấy bài viết hoặc đã bị xóa.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Quay lại
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
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/cong-dong" className="hover:text-blue-600">
            Cộng đồng
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {post.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Post Header Info */}
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/thanh-vien/${post.createdBy?._id}`}
                      className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition"
                    >
                      {post.createdBy?.avatar ? (
                        <Image
                          src={post.createdBy.avatar}
                          alt={post.createdBy.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaUserCircle size={24} />
                        </div>
                      )}
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/thanh-vien/${post.createdBy?._id}`}
                          className="font-bold text-gray-900 text-base hover:text-blue-600 transition"
                        >
                          {post.createdBy?.name || "Người dùng ẩn danh"}
                        </Link>
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Người dùng
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Đăng ngày {formatDateTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => followMutation.mutate(post.createdBy?._id)}
                      disabled={followMutation.isPending}
                      className={`hidden sm:flex items-center gap-1.5 px-4 py-1.5 border rounded-full text-sm font-bold transition ${
                        isFollowingAuthor
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {isFollowingAuthor ? (
                        <>
                          <FaCheckCircle size={12} /> Đang theo dõi
                        </>
                      ) : (
                        <>
                          <FaPlus size={12} /> Theo dõi
                        </>
                      )}
                    </button>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>
              </div>

              {/* Header Image */}
              {post.imageUrl && (
                <div className="relative w-full h-[300px] md:h-[400px] mx-auto">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Content */}
                <div
                  className="prose prose-lg max-w-none text-gray-700 mb-8 prose-imgs:rounded-xl prose-a:text-blue-600 hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Interactions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => likeMutation.mutate()}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all flex-1 sm:flex-none justify-center ${
                        isLiked
                          ? "bg-red-50 text-red-600 font-bold shadow-inner"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                      }`}
                    >
                      {isLiked ? <FaHeart /> : <FaRegHeart />}
                      <span>{likeCount} Yêu thích</span>
                    </button>

                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-medium flex-1 sm:flex-none justify-center">
                      <FaComment />
                      <span>{post.comments?.length || 0} Bình luận</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <FaFacebook size={18} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <FaFacebookMessenger size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">
                      <FaLink /> Sao chép link
                    </button>
                  </div>
                </div>

                <CommentSection postId={postId} />
              </div>
            </article>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Related Location Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider">
                Địa điểm liên quan
              </h3>
              <div className="relative h-32 w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
                {/* Placeholder Map Image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                  <FaMapMarkerAlt size={32} />
                  <span className="ml-2 text-sm font-medium">Bản đồ</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                Đỉnh Tà Xùa
              </h4>
              <p className="text-gray-500 text-xs mb-4">Bắc Yên, Sơn La</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-teal-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-teal-700 transition">
                  Chỉ đường
                </button>
                <button className="w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                  <FaBookmark />
                </button>
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider">
                Bài viết phổ biến
              </h3>
              <div className="space-y-4">
                {popularPosts?.map((p: any) => (
                  <Link
                    href={`/bai-viet/${p._id}`}
                    key={p._id}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition">
                        {p.title}
                      </h4>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {p.views || 0} lượt xem
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
