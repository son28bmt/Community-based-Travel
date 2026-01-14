"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaBookmark,
  FaChevronRight,
  FaMapMarkerAlt,
  FaShareAlt,
  FaStar,
  FaThumbsUp,
  FaUserCircle,
} from "react-icons/fa";

const gallery = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
];

const reviews = [
  {
    id: 1,
    name: "Hoàng Minh",
    rating: 5,
    time: "2 ngày trước",
    content:
      "Cát rất trắng và mịn, nước trong xanh. Mình đi vào buổi sáng khoảng 5h để ngắm bình minh thì thật sự tuyệt vời.",
  },
  {
    id: 2,
    name: "Lan Anh",
    rating: 4,
    time: "1 tuần trước",
    content:
      "Dịch vụ đầy đủ, giá cả hợp lý. Cuối tuần hơi đông nên cần đi sớm.",
  },
];

const nearby = [
  {
    name: "Bán đảo Sơn Trà",
    distance: "Cách đây 4.2 km",
    image: "https://placehold.co/96x96",
  },
  {
    name: "Cầu Rồng",
    distance: "Cách đây 2.6 km",
    image: "https://placehold.co/96x96",
  },
];

export default function PlaceDetailPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <FaChevronRight className="text-gray-400 text-xs" />
          <Link href="/kham-pha" className="hover:text-blue-600">
            Đà Nẵng
          </Link>
          <FaChevronRight className="text-gray-400 text-xs" />
          <span className="text-gray-800 font-semibold">Bãi Biển Mỹ Khê</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[320px]">
            <Image
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
              alt="Bãi Biển Mỹ Khê"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-extrabold">Bãi Biển Mỹ Khê</h1>
              <p className="text-sm text-white/80 mt-1 flex items-center gap-2">
                <FaMapMarkerAlt />
                Sơn Trà, Đà Nẵng, Việt Nam
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {gallery.map((img, index) => (
              <div
                key={img}
                className={`relative rounded-2xl overflow-hidden shadow-sm ${
                  index === 2 ? "col-span-2 h-40" : "h-36"
                }`}
              >
                <Image src={img} alt="Gallery" fill className="object-cover" />
                {index === 2 && (
                  <button className="absolute bottom-3 right-3 bg-white/90 text-xs font-semibold px-3 py-1.5 rounded-full">
                    Xem tất cả ảnh
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  Về địa điểm này
                </h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaBookmark />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaShareAlt />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bãi biển Mỹ Khê được tạp chí Forbes bình chọn là một trong
                sáu bãi biển quyến rũ nhất hành tinh. Nơi đây nổi tiếng với bờ
                cát trắng mịn, nước trong xanh và nhiều hoạt động hấp dẫn quanh
                năm.
              </p>
            </section>

            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  Vị trí & Chỉ đường
                </h2>
                <button className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-full">
                  <FaMapMarkerAlt />
                  Mở bản đồ
                </button>
              </div>
              <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src="https://placehold.co/800x300/png?text=Map+Placeholder"
                  alt="Map"
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
                <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-bold">
                  Cộng đồng đánh giá (1,240)
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 font-medium">
                  Kinh nghiệm bỏ túi
                </button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 font-medium">
                  Thảo luận
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Bạn đã từng đến đây?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đăng nhập để chia sẻ đánh giá và giúp cộng đồng du lịch.
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Đăng nhập ngay
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {review.name}
                          </p>
                          <div className="flex items-center gap-1 text-amber-400 text-xs">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <FaStar
                                key={idx}
                                className={
                                  idx < review.rating
                                    ? "text-amber-400"
                                    : "text-gray-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {review.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {review.content}
                    </p>
                    <button className="mt-3 text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <FaThumbsUp />
                      Hữu ích
                    </button>
                  </div>
                ))}
                <button className="w-full text-center text-sm font-semibold text-blue-600 hover:underline">
                  Xem thêm 1,238 đánh giá khác
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-600">
                  4.8
                </div>
                <div className="flex justify-center gap-1 text-amber-400 text-sm">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar className="text-amber-200" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dựa trên 1,240 đánh giá
                </p>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white rounded-full py-2 text-sm font-semibold">
                Viết đánh giá
              </button>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-full py-2">
                  Lưu lịch trình
                </button>
                <button className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-full py-2">
                  Chia sẻ
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                Người đóng góp
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <FaUserCircle className="text-3xl" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Nguyễn Văn Nam
                  </p>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Expert • 42 điểm
                  </span>
                </div>
                <button className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  Theo dõi
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Gần địa điểm này
              </h3>
              <div className="space-y-3">
                {nearby.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.distance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
