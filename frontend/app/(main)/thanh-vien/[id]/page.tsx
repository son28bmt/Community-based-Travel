"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaEdit,
  FaShareAlt,
  FaCamera,
  FaCheckCircle,
  FaMedal,
  FaMap,
  FaStar,
  FaBookmark,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState("activity");
  const [contribPage, setContribPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [isMe, setIsMe] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const user = data?.user || data;

  const { data: contributionsData } = useQuery({
    queryKey: ["user-contributions", id, contribPage],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/users/${id}/contributions`,
        { params: { page: contribPage, limit: 6, sort: "newest" } }
      );
      return res.data;
    },
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["user-reviews", id, reviewPage],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/users/${id}/reviews`,
        { params: { page: reviewPage, limit: 6 } }
      );
      return res.data;
    },
    enabled: !!id,
  });

  const { data: savedData } = useQuery({
    queryKey: ["user-saved", id, savedPage],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/users/${id}/saved`,
        { params: { page: savedPage, limit: 6 } }
      );
      return res.data;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const token = (session as any)?.user?.accessToken;
      if (!token) {
        toast.error("Please login to follow");
        return;
      }
      await axios.put(
        `http://localhost:5000/api/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", id] });
      toast.success("Follow updated");
    },
  });

  useEffect(() => {
    if (session?.user && user) {
      const isSameId =
        session.user.id === user._id || session.user.id === user.id;
      const isSameUsername = session.user.username === user.username;
      setIsMe(isSameId || isSameUsername);
    }
  }, [session, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );
  }

  const contributions = contributionsData?.items || [];
  const reviews = reviewsData?.items || [];
  const saved = savedData?.items || [];

  const activityItems = [...contributions, ...reviews]
    .map((item: any) => ({
      ...item,
      type: item.location ? "review" : "contribution",
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white shadow-sm pb-4">
        <div className="relative h-[300px] md:h-[400px] w-full bg-gray-200">
          {user.coverImage ? (
            <Image
              src={user.coverImage}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-cyan-500" />
          )}
          {isMe && (
            <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition">
              <FaCamera className="inline mr-2" /> Cập nhật ảnh bìa
            </button>
          )}
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-end -mt-16 md:-mt-20 mb-6 gap-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-0 flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {user.name}
                </h1>
                <span className="text-gray-400 font-medium text-lg">
                  @{user.username || user._id}
                </span>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full border border-blue-200">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-gray-500 text-sm flex items-center gap-3 justify-center md:justify-start">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>Vietnam</span>
                <FaCalendarAlt className="text-gray-400" />
                <span>
                  Đã tham gia{" "}
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pb-4">
              {isMe ? (
                <>
                  <Link href="/tai-khoan">
                    <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition flex items-center gap-2">
                      <FaEdit /> Sửa hồ sơ
                    </button>
                  </Link>
                  <Link href="/dong-gop">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition flex items-center gap-2 shadow-md shadow-blue-200">
                      <FaMap /> Thêm địa điểm
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => followMutation.mutate()}
                  className={`px-8 py-2 rounded-full font-bold transition shadow-md ${
                    user.isFollowing
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {user.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              )}
              <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition">
                <FaShareAlt />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-gray-900">
                {user.stats?.contributions || 0}
              </div>
              <div className="text-xs text-gray-500 uppercase font-semibold">
                Đóng góp
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-gray-900">
                {user.stats?.followers || 0}
              </div>
              <div className="text-xs text-gray-500 uppercase font-semibold">
                Người theo dõi
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="text-2xl font-bold text-gray-900">
                {user.stats?.following || 0}
              </div>
              <div className="text-xs text-gray-500 uppercase font-semibold">
                Đang theo dõi
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUserFriends className="text-blue-500" />
                Giới thiệu
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {user.bio || "Chưa có giới thiệu."}
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
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMedal className="text-amber-500" />
                  Danh hiệu
                </h3>
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badge: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 w-16"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 text-xl border-2 border-white shadow-sm">
                        <FaMedal />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase text-center">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 px-2">
              <div className="flex overflow-x-auto scrollbar-hide">
                {["activity", "contributions", "reviews", "saved"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {tab === "activity" && "Hoạt động"}
                      {tab === "contributions" && "Địa điểm đã thêm"}
                      {tab === "reviews" && "Đánh giá"}
                      {tab === "saved" && "Đã lưu"}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === "activity" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-4">
                    {activityItems.map((item: any, idx: number) => (
                      <div
                        key={`${item._id}-${idx}`}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          {item.type === "review" ? <FaStar /> : <FaMap />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {item.type === "review"
                              ? `Đã đánh giá ${item.location?.name || "một địa điểm"}`
                              : `Đã thêm ${item.name}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        {item.type === "contribution" && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              item.status === "approved"
                                ? "bg-emerald-100 text-emerald-600"
                                : item.status === "pending"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.status === "approved"
                              ? "Đã duyệt"
                              : item.status === "pending"
                                ? "Chờ duyệt"
                                : item.status === "rejected"
                                  ? "Từ chối"
                                  : item.status}
                          </span>
                        )}
                      </div>
                    ))}
                    {!activityItems.length && (
                      <div className="text-sm text-gray-500 text-center py-8">
                        Chưa có hoạt động nào.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "contributions" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Địa điểm đã thêm
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contributions.map((loc: any) => (
                      <div
                        key={loc._id}
                        className="border border-gray-100 rounded-2xl p-4 flex gap-4"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {loc.imageUrl ? (
                            <Image
                              src={loc.imageUrl}
                              alt={loc.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {loc.name}
                            </h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                                loc.status === "approved"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : loc.status === "pending"
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {loc.status === "approved"
                                ? "Đã duyệt"
                                : loc.status === "pending"
                                  ? "Chờ duyệt"
                                  : loc.status === "rejected"
                                    ? "Từ chối"
                                    : loc.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {loc.province}
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            {loc.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!contributions.length && (
                    <div className="text-sm text-gray-500 text-center py-8">
                      Chưa có đóng góp nào.
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={contribPage === 1}
                      onClick={() => setContribPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </button>
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={
                        contribPage >=
                        (contributionsData?.pagination?.totalPages || 1)
                      }
                      onClick={() => setContribPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Đánh giá
                  </h3>
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div
                        key={review._id}
                        className="border border-gray-100 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.location?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.location?.province || ""}
                            </p>
                          </div>
                          <div className="flex text-amber-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < review.rating ? "" : "text-gray-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  {!reviews.length && (
                    <div className="text-sm text-gray-500 text-center py-8">
                      Chưa có đánh giá nào.
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={reviewPage === 1}
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </button>
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={
                        reviewPage >= (reviewsData?.pagination?.totalPages || 1)
                      }
                      onClick={() => setReviewPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Địa điểm đã lưu
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {saved.map((loc: any) => (
                      <div
                        key={loc._id}
                        className="border border-gray-100 rounded-2xl p-4 flex gap-4"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {loc.imageUrl ? (
                            <Image
                              src={loc.imageUrl}
                              alt={loc.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {loc.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {loc.province}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-blue-600 mt-2">
                            <FaBookmark /> {loc.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!saved.length && (
                    <div className="text-sm text-gray-500 text-center py-8">
                      Chưa có địa điểm đã lưu.
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={savedPage === 1}
                      onClick={() => setSavedPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </button>
                    <button
                      className="px-4 py-2 text-xs border border-gray-200 rounded-full disabled:opacity-50"
                      disabled={
                        savedPage >= (savedData?.pagination?.totalPages || 1)
                      }
                      onClick={() => setSavedPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
