"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaShareAlt,
  FaStar,
  FaImages,
  FaPen,
  FaRegBookmark,
  FaRegShareSquare,
  FaMap,
  FaUserCircle,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import ReviewModal from "@/components/ReviewModal";
import toast from "react-hot-toast";

export default function LocationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch Location Detail
  const {
    data: location,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["location-detail", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/locations/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch Reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["location-reviews", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch Nearby Places (Same Province)
  const { data: nearbyLocationsData } = useQuery({
    queryKey: ["nearby-locations", location?.province],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/locations", {
        params: {
          province: location.province,
          limit: 5, // Fetch 5 to ensure we have enough after filtering current one
        },
      });
      return res.data;
    },
    enabled: !!location?.province,
  });

  const nearbyPlaces =
    nearbyLocationsData?.items
      ?.filter((item: any) => item._id !== id)
      .slice(0, 4) || [];

  const reviews = reviewsData?.items || [];
  const totalReviews =
    location?.totalReviews || reviewsData?.pagination?.total || 0;
  const rating = location?.rating || 0;

  const handleWriteReview = () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để viết đánh giá");
      return;
    }
    setShowReviewModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !location) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy địa điểm</h2>
        <p>Có thể địa điểm này đã bị xóa hoặc không tồn tại.</p>
        <Link
          href="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const galleryImages =
    location.images && location.images.length > 0
      ? location.images
      : location.imageUrl
        ? [location.imageUrl]
        : [];

  return (
    <div className="bg-white min-h-screen pt-24 pb-16 font-sans">
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        locationId={id}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-wide">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>&rsaquo;</span>
          <Link href="/kham-pha" className="hover:text-blue-600">
            {location.province || "Đà Nẵng"}
          </Link>
          <span>&rsaquo;</span>
          <span className="text-gray-900 font-bold">{location.name}</span>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10 h-[400px] lg:h-[480px]">
          {/* Main Image (Left) */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg group h-full">
            {galleryImages[0] ? (
              <Image
                src={galleryImages[0]}
                alt={location.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                Chưa có ảnh
              </div>
            )}
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
              <h1 className="text-3xl font-extrabold mb-1">{location.name}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <FaMapMarkerAlt />
                <span>
                  {location.address || `${location.province}, Việt Nam`}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Images (Right) */}
          <div className="grid grid-rows-2 gap-4 h-full">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Top Right Images */}
              <div className="relative rounded-3xl overflow-hidden shadow-md">
                {galleryImages[1] && (
                  <Image
                    src={galleryImages[1]}
                    alt="Gallery 2"
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    unoptimized
                  />
                )}
              </div>
              <div className="relative rounded-3xl overflow-hidden shadow-md">
                {galleryImages[2] && (
                  <Image
                    src={galleryImages[2]}
                    alt="Gallery 3"
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    unoptimized
                  />
                )}
              </div>
            </div>
            {/* Bottom Right Wide Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-md">
              {galleryImages[3] ? (
                <Image
                  src={galleryImages[3]}
                  alt="Gallery 4"
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                  unoptimized
                />
              ) : (
                galleryImages[0] && (
                  <Image
                    src={galleryImages[0]}
                    alt="Gallery 4 Placeholder"
                    fill
                    className="object-cover hover:scale-105 transition-transform blur-sm"
                    unoptimized
                  />
                )
              )}

              <button className="absolute bottom-4 right-4 bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <FaImages />
                Xem tất cả ảnh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Về địa điểm này
                </h2>
                <div className="flex gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    <FaShareAlt />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    <FaHeart />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {location.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: location.description }}
                  />
                ) : (
                  <p>Chưa có mô tả chi tiết cho địa điểm này.</p>
                )}
              </div>
            </div>

            {/* Location & Map Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Vị trí & Chỉ đường
                </h2>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors">
                  <FaMap /> Mở bản đồ
                </button>
              </div>
              <div className="relative h-64 w-full bg-gray-200 rounded-3xl overflow-hidden border border-gray-100">
                {/* Placeholder Map Image */}
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-4xl text-blue-400 mx-auto mb-2 animate-bounce" />
                    <p className="text-gray-500 font-medium">
                      {location.address || location.province}, Việt Nam
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs & Reviews */}
            <div>
              <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
                <button className="pb-3 border-b-2 border-blue-500 text-blue-600 font-bold text-sm">
                  Cộng đồng đánh giá ({totalReviews})
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">
                  Kinh nghiệm bỏ túi
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">
                  Thảo luận
                </button>
              </div>

              {/* Login Prompt - Only show if not logged in and no reviews? Or always show CTA? 
                  Let's change this to "Write Review" CTA if logged in, or Login prompt if not.
              */}
              {!session ? (
                <div className="bg-blue-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Bạn đã từng đến đây?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Đăng nhập để chia sẻ đánh giá và giúp đỡ cộng đồng du
                      lịch.
                    </p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="px-5 py-2.5 bg-blue-500 text-white font-bold text-sm rounded-xl hover:bg-blue-600 shadow-md shadow-blue-200 transition-colors whitespace-nowrap"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                    {session.user?.name?.[0] || <FaUserCircle />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      Chia sẻ trải nghiệm của bạn
                    </p>
                    <p className="text-sm text-gray-500">
                      Đánh giá giúp cộng đồng có lựa chọn tốt hơn.
                    </p>
                  </div>
                  <button
                    onClick={handleWriteReview}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    Viết đánh giá
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <div
                      key={review._id}
                      className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {review.userName?.[0] || "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {review.userName || "Người dùng ẩn danh"}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
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
                      <div className="mt-3">
                        <p className="text-gray-700 leading-relaxed text-sm mb-3">
                          {review.content}
                        </p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {review.images.map((img: string, idx: number) => (
                              <div
                                key={idx}
                                className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-200"
                              >
                                <Image
                                  src={img}
                                  alt="review img"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">
                      Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                    </p>
                    <button
                      onClick={handleWriteReview}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Viết đánh giá ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Rating Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 text-center top-24">
              <div className="text-6xl font-extrabold text-blue-500 mb-2">
                {rating > 0 ? rating.toFixed(1) : "N/A"}
              </div>
              <div className="flex justify-center text-amber-400 text-lg mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(rating) ? "" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-6 font-medium">
                Dựa trên {totalReviews} đánh giá
              </p>

              <button
                onClick={handleWriteReview}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 hover:shadow-xl transition-all mb-4 flex items-center justify-center gap-2"
              >
                <FaPen /> Viết đánh giá
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <FaRegBookmark /> Lưu lịch trình
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <FaRegShareSquare /> Chia sẻ
                </button>
              </div>
            </div>

            {/* Contributor Card */}
            {location.createdBy && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold border border-green-200 uppercase">
                    {location.createdBy.name?.substring(0, 2) || "AD"}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Người đóng góp
                    </p>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {location.createdBy.name || "Admin"}
                    </h4>
                    <p className="text-xs text-gray-400">Expert Guide</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors">
                  Theo dõi
                </button>
              </div>
            )}

            {/* Nearby Places */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                Gần địa điểm này
              </h3>
              <div className="space-y-4">
                {nearbyPlaces.length > 0 ? (
                  nearbyPlaces.map((place: any) => (
                    <Link
                      href={`/dia-diem/${place._id}`}
                      key={place._id}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        {place.imageUrl ? (
                          <Image
                            src={place.imageUrl}
                            alt={place.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                          {place.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {place.category}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Không tìm thấy địa điểm gần đây.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
