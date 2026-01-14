"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaBookmark,
  FaChevronDown,
  FaCoffee,
  FaFilter,
  FaFish,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaThLarge,
  FaUtensils,
} from "react-icons/fa";

const categories = [
  { id: "all", label: "Tất cả", icon: FaThLarge },
  { id: "restaurant", label: "Quán ăn", icon: FaUtensils },
  { id: "coffee", label: "Cà phê & Trà", icon: FaCoffee },
  { id: "specialty", label: "Đặc sản", icon: FaFilter },
  { id: "seafood", label: "Hải sản", icon: FaFish },
];

const places = [
  {
    id: "banh-xeo",
    name: "Bánh Xèo Bà Dưỡng",
    address: "K142/2/03 Hoàng Diệu, Hải Châu",
    rating: 4.8,
    reviews: 1200,
    price: "20k - 50k VND",
    tag: "Nổi bật",
    image:
      "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=1200&q=80",
    badges: ["Đặc sản", "Lâu đời"],
  },
  {
    id: "hai-san",
    name: "Hải Sản Bé Mặn",
    address: "Võ Nguyên Giáp, Sơn Trà",
    rating: 4.5,
    reviews: 650,
    price: "100k - 500k VND",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    badges: ["Hải sản tươi", "View biển"],
  },
  {
    id: "wonderlust",
    name: "Wonderlust Cafe",
    address: "96 Trần Phú, Hải Châu",
    rating: 4.7,
    reviews: 840,
    price: "40k - 90k VND",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    badges: ["Minimalist", "Chill"],
  },
  {
    id: "my-quang",
    name: "Mỳ Quảng Ếch Bếp Trang",
    address: "441 Ông Ích Khiêm, Hải Châu",
    rating: 4.6,
    reviews: 1500,
    price: "50k - 100k VND",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    badges: ["Món chính", "Gia đình"],
  },
  {
    id: "cong-caphe",
    name: "Cộng Cà Phê",
    address: "98-96 Bạch Đằng, Hải Châu",
    rating: 4.4,
    reviews: 1300,
    price: "35k - 65k VND",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    badges: ["Bạch Đằng", "Cổ điển"],
  },
  {
    id: "quan-tran",
    name: "Quán Trần",
    address: "4 Lê Duẩn, Hải Châu",
    rating: 4.3,
    reviews: 920,
    price: "70k - 160k VND",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    badges: ["Bánh tráng cuốn", "Tiệc nhẹ"],
  },
];

export default function LocationDetailPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="bg-slate-50 min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <span>Đà Nẵng</span>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Ẩm thực</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Danh mục</h2>
              <div className="space-y-2">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const active = activeCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveCategory(item.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">
                Khoảng giá (VND)
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>50k</span>
                <span>500k</span>
              </div>
              <input type="range" min="0" max="100" className="w-full" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-800">Đánh giá</h3>
              {[5, 4].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer"
                >
                  <input type="radio" name="rating" />
                  <span className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rating }).map((_, idx) => (
                      <FaStar key={idx} />
                    ))}
                  </span>
                  <span className="text-xs text-gray-500">
                    Từ {rating} sao
                  </span>
                </label>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-800">Sắp xếp theo</h3>
              <button className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50">
                Phổ biến nhất
                <FaChevronDown />
              </button>
            </div>
          </aside>

          <main className="flex-1 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Ăn uống tại Đà Nẵng
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                  Khám phá 1,240 địa điểm ẩm thực đặc sắc tại thành phố biển.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                  <FaSearch className="text-gray-400" />
                  <input
                    placeholder="Tìm địa điểm, món ăn..."
                    className="bg-transparent outline-none w-44"
                  />
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  <FaMapMarkerAlt />
                  Bản đồ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {places.map((place) => (
                <Link
                  key={place.id}
                  href={`/dia-diem/${encodeURIComponent("da-nang")}/${place.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      sizes="(max-width: 1200px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-md">
                      <FaBookmark />
                    </button>
                    {place.tag ? (
                      <span className="absolute bottom-3 left-3 rounded-full bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-1">
                        {place.tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {place.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {place.address}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <FaStar />
                        {place.rating}
                        <span className="text-xs text-gray-400">
                          ({place.reviews})
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {place.price}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {place.badges.map((badge) => (
                        <span
                          key={badge}
                          className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700">
                Xem thêm địa điểm
                <FaChevronDown />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
