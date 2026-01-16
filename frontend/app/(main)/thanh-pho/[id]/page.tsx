"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  FaMap,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const categories = [
  { id: "all", label: "Tất cả", icon: FaThLarge },
  { id: "Kỳ quan", label: "Kỳ quan", icon: FaMap },
  { id: "Biển đảo", label: "Biển đảo", icon: FaFish },
  { id: "Lịch sử", label: "Lịch sử", icon: FaMapMarkerAlt },
  { id: "Ẩm thực", label: "Ẩm thực", icon: FaUtensils },
];

export default function CityDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(500); // Mock value
  const [search, setSearch] = useState("");

  const { data: cityData, isLoading: isCityLoading } = useQuery({
    queryKey: ["city", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/cities/${id}`);
      return res.data.city;
    },
    enabled: !!id,
  });

  const { data: locationsData, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations-in-city", id, activeCategory, search],
    queryFn: async () => {
      if (!cityData?.name) return { items: [] };
      const res = await axios.get("http://localhost:5000/api/locations", {
        params: {
          province: cityData.name,
          category: activeCategory !== "all" ? activeCategory : undefined,
          search: search || undefined,
          limit: 20,
        },
      });
      return res.data;
    },
    enabled: !!cityData?.name,
  });

  const locations = locationsData?.items || [];

  if (isCityLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center text-gray-500">
        Không tìm thấy thông tin thành phố.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/kham-pha" className="hover:text-blue-600">
            Khám phá
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">{cityData.name}</span>
        </div>

        {/* City Banner Info */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-lg">
          {cityData.imageUrl ? (
            <Image
              src={cityData.imageUrl}
              alt={cityData.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300"></div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              {cityData.name}
            </h1>
            <p className="text-white/90 text-sm md:text-lg max-w-2xl">
              {cityData.description}
            </p>
          </div>
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

            {/* Price Range Filter (Mock) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">
                Khoảng giá (VND)
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0</span>
                <span>Max</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                disabled
                className="w-full opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-center text-gray-400">
                (Tính năng đang phát triển)
              </p>
            </div>
          </aside>

          <main className="flex-1 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Địa điểm nổi bật
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Tìm thấy {locations.length} địa điểm tại {cityData.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                  <FaSearch className="text-gray-400" />
                  <input
                    placeholder="Tìm địa điểm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none w-44"
                  />
                </div>
              </div>
            </div>

            {isLocationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {locations.map((place: any) => (
                  <Link
                    key={place._id}
                    href={`/dia-diem/${place._id}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {place.imageUrl ? (
                        <Image
                          src={place.imageUrl}
                          alt={place.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          No Image
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-md hover:text-blue-600">
                        <FaBookmark />
                      </button>
                      <span className="absolute bottom-3 left-3 rounded-full bg-blue-600/90 text-white text-[10px] font-semibold px-2.5 py-1">
                        {place.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {place.province}
                      </p>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <FaStar />
                          4.5
                          <span className="text-xs text-gray-400 font-normal">
                            (120)
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {place.status === "approved" ? "Verified" : "New"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Chưa có địa điểm nào trong danh mục này.
              </div>
            )}

            {locations.length > 0 && (
              <div className="flex justify-center mt-8">
                <button className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 text-gray-600 px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Xem thêm địa điểm
                  <FaChevronDown />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
