"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaEdit,
  FaShareAlt,
  FaCamera,
  FaMap,
  FaStar,
  FaBookmark,
  FaSmile,
  FaImage,
  FaMedal,
  FaCheckCircle,
  FaCommentAlt,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import CreatePostModal from "@/components/CreatePostModal";
import clsx from "clsx";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [activeTab, setActiveTab] = useState("post");
  const [contribPage, setContribPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false); // Deprecated

  // Fetch User Data
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile", id, session?.user?.accessToken],
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
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}`,
        config,
      );
      return res.data;
    },
    enabled: !!id,
  });

  const user = data?.user || data;

  const isMe =
    session?.user && user
      ? session.user.id === user._id ||
        session.user.id === user.id ||
        (session.user as any).username === user.username
      : false;

  // Effect for updating local form removed as form is moved to settings

  // Fetch data for tabs
  const { data: contributionsData } = useQuery({
    queryKey: ["user-contributions", id, contribPage],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/contributions`,
        { params: { page: contribPage, limit: 6, sort: "newest" } },
      );
      return res.data;
    },
    enabled: !!id && activeTab === "contributions",
  });

  const { data: postsData } = useQuery({
    queryKey: ["user-posts", id, postPage],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/posts`,
        { params: { page: postPage, limit: 6 } },
      );
      return res.data;
    },
    enabled: !!id && activeTab === "post",
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["user-reviews", id, reviewPage],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/reviews`,
        { params: { page: reviewPage, limit: 6 } },
      );
      return res.data;
    },
    enabled: !!id && activeTab === "reviews",
  });

  const { data: savedData } = useQuery({
    queryKey: ["user-saved", id, savedPage],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/saved`,
        { params: { page: savedPage, limit: 6 } },
      );
      return res.data;
    },
    enabled: !!id && activeTab === "saved",
  });

  // Follow Mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const token = (session as any)?.user?.accessToken;
      if (!token) {
        toast.error("Vui lòng đăng nhập để theo dõi");
        throw new Error("No token");
      }
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: ["user-profile", id] },
        (old: any) => {
          if (!old) return old;
          const currentUserData = old.user || old;
          return {
            ...old,
            user: {
              ...currentUserData,
              isFollowing: data.isFollowing,
              stats: {
                ...currentUserData.stats,
                followers: data.isFollowing
                  ? (currentUserData.stats?.followers || 0) + 1
                  : (currentUserData.stats?.followers || 1) - 1,
              },
            },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile", id] });
      toast.success(data.isFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi");
    },
    onError: (err) => {
      toast.error("Lỗi khi cập nhật trạng thái theo dõi");
    },
  });

  // UpdateProfileMutation moved to settings/ProfileSettings

  // Avatar upload logic moved to settings/ProfileSettings
  const handleAvatarUpload = async () => {}; // No-op replacement to avoid breaking render if referenced (it won't be)

  // Function removed as it is now handled in Settings page

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-gray-500">
        <div className="text-xl font-bold mb-2">Không tìm thấy người dùng</div>
        <Link href="/" className="text-blue-600 hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const contributions = contributionsData?.items || [];
  const reviews = reviewsData?.items || [];
  const saved = savedData?.items || [];
  const posts = postsData?.items || [];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-48 md:h-80 w-full bg-gray-200">
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
        {/* Mobile Back Button equivalent/Header already handles nav */}
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-24 mb-4 flex flex-col md:flex-row items-end md:items-start gap-4 md:gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-5xl font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            {isMe && (
              <button
                className="absolute bottom-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full shadow-md transition-colors"
                title="Change Avatar"
                onClick={() => router.push("/cai-dat")}
              >
                <FaCamera size={14} />
              </button>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="flex-1 w-full md:w-auto text-center md:text-left pt-2 md:pt-32 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {user.name}
              </h1>
              {user.role === "admin" && (
                <FaCheckCircle
                  className="text-blue-500 text-lg hidden md:block"
                  title="Admin"
                />
              )}
            </div>
            <p className="text-gray-500 font-medium mb-3">
              @{user.username || user._id?.slice(0, 8)}
            </p>

            {/* Stats Row Mobile - Hidden on Desktop if desired, or keep specific layout */}
            <div className="flex justify-center md:justify-start gap-6 text-sm mb-4">
              <div className="text-center md:text-left">
                <span className="font-bold text-gray-900 block md:inline md:mr-1">
                  {user.stats?.followers || 0}
                </span>
                <span className="text-gray-500">Người theo dõi</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-gray-900 block md:inline md:mr-1">
                  {user.stats?.following || 0}
                </span>
                <span className="text-gray-500">Đang theo dõi</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-gray-900 block md:inline md:mr-1">
                  {user.stats?.contributions || 0}
                </span>
                <span className="text-gray-500">Đóng góp</span>
              </div>
            </div>

            {user.bio && (
              <p className="text-gray-600 text-sm mb-4 max-w-2xl mx-auto md:mx-0 line-clamp-2 md:line-clamp-none">
                {user.bio}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end mb-4 md:mb-8">
            {isMe ? (
              <button
                type="button"
                onClick={() => router.push("/cai-dat")}
                className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors text-sm"
              >
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={clsx(
                  "flex-1 md:flex-none px-8 py-2.5 rounded-full font-bold transition-all text-sm shadow-sm",
                  user.isFollowing
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-black text-white hover:bg-gray-800",
                )}
              >
                {followMutation.isPending
                  ? "Đang xử lý..."
                  : user.isFollowing
                    ? "Đang theo dõi"
                    : "Theo dõi"}
              </button>
            )}
            <button className="p-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
              <FaShareAlt />
            </button>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-6 md:gap-8">
            {[
              { id: "post", label: "Bài viết" },
              { id: "contributions", label: "Địa điểm" },
              { id: "reviews", label: "Đánh giá" },
              { id: "saved", label: "Đã lưu" },
              { id: "about", label: "Giới thiệu" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative",
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-800",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="container mx-auto px-4 py-6 min-h-[400px]">
        {/* 1. POSTS TAB */}
        {activeTab === "post" && (
          <div className="max-w-2xl mx-auto">
            {/* Create Post Input (Only Me) */}
            {isMe && (
              <div
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsCreatePostOpen(true)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Me"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 text-gray-500 text-sm">
                  Bạn đang nghĩ gì?
                </div>
                <div className="flex items-center text-gray-400 px-2">
                  <FaImage />
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <div
                    key={post._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/bai-viet/${post._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : null}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {user.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {post.content?.replace(/<[^>]+>/g, "")}
                    </p>

                    {post.imageUrl && (
                      <div className="relative w-full h-64 rounded-xl overflow-hidden mb-3">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-gray-500 text-sm border-t border-gray-50 pt-3">
                      <span className="flex items-center gap-1">
                        <FaBookmark className="text-gray-400" />{" "}
                        {post.category || "General"}
                      </span>
                      {/* Add like/comment counts if available in API */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Chưa có bài viết nào
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CONTRIBUTIONS (LOCATIONS) TAB */}
        {activeTab === "contributions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributions.length > 0 ? (
              contributions.map((loc: any) => (
                <Link
                  href={`/dia-diem/${loc._id}`}
                  key={loc._id}
                  className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 bg-gray-200">
                    {loc.imageUrl ? (
                      <Image
                        src={loc.imageUrl}
                        alt={loc.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FaMapMarkerAlt size={24} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={clsx(
                          "px-2 py-1 text-[10px] font-bold uppercase rounded-lg shadow-sm border border-white/20 backdrop-blur-md",
                          loc.status === "approved"
                            ? "bg-green-500/90 text-white"
                            : loc.status === "rejected"
                              ? "bg-red-500/90 text-white"
                              : "bg-yellow-500/90 text-white",
                        )}
                      >
                        {loc.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <FaMapMarkerAlt className="text-gray-300" />{" "}
                      {loc.province}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {loc.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(loc.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500 text-sm">
                Chưa có địa điểm nào được thêm
              </div>
            )}
          </div>
        )}

        {/* 3. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review: any) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                  <Link
                    href={
                      review.location ? `/dia-diem/${review.location._id}` : "#"
                    }
                    className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50 hover:bg-gray-50 -mx-5 px-5 pt-2 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {review.location?.name || "Địa điểm không tồn tại"}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {review.location?.province}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.content}
                  </p>
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {review.images.map((img: string, i: number) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100"
                        >
                          <Image
                            src={img}
                            alt="review"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                Chưa có đánh giá nào
              </div>
            )}
          </div>
        )}

        {/* 4. SAVED TAB */}
        {activeTab === "saved" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {saved.length > 0 ? (
              saved.map((loc: any) => (
                <Link
                  href={`/dia-diem/${loc._id}`}
                  key={loc._id}
                  className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-40 bg-gray-200">
                    {loc.imageUrl ? (
                      <Image
                        src={loc.imageUrl}
                        alt={loc.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FaBookmark size={20} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm truncate mb-1">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{loc.province}</p>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {loc.category}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500 text-sm">
                Chưa có địa điểm đã lưu
              </div>
            )}
          </div>
        )}

        {/* 5. ABOUT TAB */}
        {activeTab === "about" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                Giới thiệu
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {user.bio || "Người dùng chưa cập nhật giới thiệu."}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaMapMarkerAlt className="text-gray-400 w-5" />
                  <span>
                    Đến từ <strong>Vietnam</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaCalendarAlt className="text-gray-400 w-5" />
                  <span>
                    Tham gia{" "}
                    <strong>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {user.badges && user.badges.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Danh hiệu
                </h3>
                <div className="flex flex-wrap gap-4">
                  {user.badges.map((badge: string, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 text-2xl">
                        <FaMedal />
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal removed - Use /cai-dat page */}
    </div>
  );
}
