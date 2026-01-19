"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaHotel,
  FaUtensils,
  FaMap,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const iconMap: Record<string, React.ReactNode> = {
  utensils: <FaUtensils aria-hidden="true" />,
  hotel: <FaHotel aria-hidden="true" />,
  map: <FaMapMarkerAlt aria-hidden="true" />,
  camera: <FaMap aria-hidden="true" />,
  bed: <FaHotel aria-hidden="true" />,
  coffee: <FaUtensils aria-hidden="true" />,
};

interface Category {
  _id: string;
  name: string;
  icon: string;
}

interface City {
  _id: string;
  name: string;
  imageUrl: string;
  region: string;
  description: string;
}

interface Location {
  _id: string;
  name: string;
  imageUrl: string;
  category: string;
  ratingAvg?: number;
  province: string;
  description: string;
  updatedAt: string;
}

const resolveIcon = (iconStr: string) => {
  return iconMap[iconStr] || <FaMapMarkerAlt aria-hidden="true" />;
};

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(search)}`);
    }
  };

  // Fetch Categories
  const { data: categoriesData, isError: isCatError } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/categories`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData?.items || [];

  // Fetch Cities
  const {
    data: citiesData,
    isLoading: isCitiesLoading,
    isError: isCitiesError,
  } = useQuery({
    queryKey: ["home-cities"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/cities`, {
        params: { limit: 4, page: 1 },
      });
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Fetch Featured Locations
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    isError: isLocError,
  } = useQuery({
    queryKey: ["home-locations"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/locations`, {
        params: { limit: 8, page: 1, includeRatings: "1" },
      });
      return res.data;
    },
    refetchInterval: 30000,
  });

  const featuredCities = citiesData?.items || [];
  const featuredLocations = locationsData?.items || [];

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 
        BREAKPOINT ANALYSIS:
        - Mobile (<768px): Stacked layout, large touch targets (44px+), reduced font sizes.
        - Tablet (768px-1024px): 2-column grids (grid-cols-2), moderate whitespace.
        - Desktop (>1024px): 4-column grids (grid-cols-4), generous spacing, hover effects enabled.
      */}

      {/* Hero Section */}
      <section
        className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden"
        aria-label="Introduction"
      >
        <div className="absolute inset-0 bg-gray-900">
          <Image
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
            alt="Vịnh Hạ Long Việt Nam"
            fill
            priority
            className="object-cover opacity-60 mix-blend-overlay"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-50 text-sm font-bold mb-6 backdrop-blur-md uppercase tracking-wider">
              Khám phá Việt Nam
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-tight drop-shadow-lg">
              Vẻ đẹp <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Bất Tận
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-100 max-w-2xl mx-auto font-light leading-relaxed">
              Kết nối với hàng ngàn địa điểm du lịch, văn hóa và ẩm thực độc
              đáo.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="bg-white p-1.5 rounded-full shadow-2xl max-w-xl mx-auto flex items-center gap-1 border border-white/20 transition-all focus-within:ring-4 focus-within:ring-blue-500/20"
              role="search"
            >
              <div className="flex-1 flex items-center px-4 md:px-6 h-11 md:h-12 bg-transparent">
                <FaSearch
                  className="text-gray-400 mr-3 text-base md:text-lg shrink-0"
                  aria-hidden="true"
                />
                <label htmlFor="hero-search" className="sr-only">
                  Tìm kiếm địa điểm
                </label>
                <input
                  id="hero-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bạn muốn đi đâu?"
                  className="bg-transparent outline-none w-full text-gray-800 placeholder-gray-400 text-sm md:text-base font-medium truncate"
                />
              </div>
              <button
                type="submit"
                className="h-11 md:h-12 px-6 md:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0"
                aria-label="Tìm kiếm"
              >
                <span className="hidden md:inline">Tìm kiếm</span>
                <FaSearch className="md:hidden text-sm" />
              </button>
            </form>

            {/* Suggetions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-200 font-medium">
              <span className="hidden sm:inline opacity-70">Gợi ý:</span>
              {["Đà Nẵng", "Hà Nội", "Hội An", "Phú Quốc"].map((city) => (
                <Link
                  key={city}
                  href={`/tim-kiem?q=${encodeURIComponent(city)}`}
                  className="hover:text-white hover:underline decoration-blue-400 underline-offset-4 decoration-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
                >
                  {city}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section - Grid Layout */}
      <section
        className="py-16 md:py-24 bg-slate-50"
        aria-labelledby="category-heading"
      >
        <div className="container mx-auto px-4">
          <h2 id="category-heading" className="sr-only">
            Danh mục du lịch
          </h2>

          {isCatError ? (
            <div className="text-center text-red-500 py-8">
              Không thể tải danh mục. Vui lòng thử lại sau.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {categories.map((cat: Category, idx: number) => (
                <Link
                  href={`/tim-kiem?category=${encodeURIComponent(cat.name)}`}
                  key={cat._id || idx}
                  className="block group focus:outline-none"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center gap-4 transition-all h-full focus-within:ring-2 focus-within:ring-blue-500"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl text-blue-600 bg-blue-50 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                      {resolveIcon(cat.icon)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base md:text-lg text-center group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Cities - 4 Columns Desktop, 2 Mobile */}
      <section
        className="py-16 md:py-24 bg-white"
        aria-labelledby="cities-heading"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
            <div className="text-center md:text-left">
              <span className="text-blue-600 font-bold uppercase tracking-wider text-xs md:text-sm mb-2 block">
                Điểm đến hàng đầu
              </span>
              <h2
                id="cities-heading"
                className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
              >
                Thành phố nổi tiếng
              </h2>
            </div>
            <Link
              href="/kham-pha"
              className="text-gray-600 font-semibold flex items-center gap-2 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Xem tất cả <FaArrowRight aria-hidden="true" className="text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {isCitiesLoading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-gray-100 rounded-2xl md:rounded-3xl animate-pulse"
                  role="status"
                  aria-label="Loading city"
                />
              ))
            ) : isCitiesError ? (
              <div className="col-span-full text-center text-gray-500">
                Không thể tải dữ liệu thành phố.
              </div>
            ) : (
              featuredCities.map((city: City) => (
                <Link
                  href={`/thanh-pho/${city._id}`}
                  key={city._id}
                  className="group block h-full relative overflow-hidden rounded-2xl md:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                  aria-label={`Khám phá ${city.name}`}
                >
                  <div className="aspect-[3/4] relative w-full transition-transform duration-700 group-hover:scale-105">
                    <Image
                      src={
                        city.imageUrl ||
                        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"
                      } // Fallback image
                      alt={city.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      unoptimized={!city.imageUrl?.startsWith("/")} // Only optimize local images if any
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 text-white transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-blue-300 mb-1 md:mb-2 line-clamp-1">
                      {city.region}
                    </p>
                    <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 line-clamp-1 md:line-clamp-2">
                      {city.name}
                    </h3>
                    <p className="hidden md:block text-sm text-gray-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {stripHtml(city.description) ||
                        "Khám phá địa điểm du lịch..."}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Locations Cards */}
      <section
        className="py-16 md:py-24 bg-slate-50"
        aria-labelledby="locations-heading"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-xs md:text-sm mb-3 block">
              Gợi ý cho bạn
            </span>
            <h2
              id="locations-heading"
              className="text-2xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6"
            >
              Địa điểm yêu thích
            </h2>
            <p className="text-gray-500 text-sm md:text-lg">
              Tuyển tập những địa điểm được cộng đồng đánh giá cao nhất.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {isLocationsLoading ? (
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 md:h-80 bg-white rounded-2xl md:rounded-3xl animate-pulse"
                  role="status"
                  aria-label="Loading location"
                />
              ))
            ) : isLocError ? (
              <div className="col-span-full text-center text-red-500">
                Lỗi kết nối máy chủ.
              </div>
            ) : (
              featuredLocations.map((loc: Location) => (
                <Link
                  href={`/dia-diem/${loc._id}`}
                  key={loc._id}
                  className="group flex flex-col h-full focus:outline-none"
                >
                  <article className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 h-full flex flex-col group-focus-within:ring-2 ring-blue-500">
                    <div className="relative h-32 md:h-56 w-full overflow-hidden bg-gray-100">
                      <Image
                        src={
                          loc.imageUrl ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                        }
                        alt={loc.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        unoptimized={!loc.imageUrl?.startsWith("/")}
                      />
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow text-gray-800 flex items-center gap-1">
                        <FaStar className="text-amber-400" aria-hidden="true" />
                        {loc.ratingAvg ? loc.ratingAvg.toFixed(1) : "N/A"}
                      </div>
                      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-blue-600/90 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-white uppercase shadow">
                        {loc.category}
                      </div>
                    </div>

                    <div className="p-3 md:p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm md:text-xl text-gray-900 mb-1 md:mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {loc.name}
                        </h3>
                        <div className="flex items-center gap-1 md:gap-2 text-gray-500 text-xs md:text-sm mb-2 md:mb-3">
                          <FaMapMarkerAlt
                            className="text-blue-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1">{loc.province}</span>
                        </div>
                        <p className="hidden md:block text-sm text-gray-500 line-clamp-2 mb-4">
                          {stripHtml(loc.description) ||
                            "Chưa có mô tả chi tiết."}
                        </p>
                      </div>

                      <div className="md:border-t border-gray-50 md:pt-4 flex items-center justify-between text-[10px] md:text-xs text-gray-400 font-medium mt-auto">
                        <time
                          dateTime={loc.updatedAt}
                          className="hidden md:inline"
                        >
                          {loc.updatedAt
                            ? new Date(loc.updatedAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Mới cập nhật"}
                        </time>
                        <time dateTime={loc.updatedAt} className="md:hidden">
                          {loc.updatedAt
                            ? new Date(loc.updatedAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Mới"}
                        </time>
                        <span className="text-blue-600 group-hover:underline hidden md:inline">
                          Chi tiết &rarr;
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/kham-pha"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-gray-800 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Xem Thêm Địa Điểm <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24 bg-blue-600 relative overflow-hidden text-center"
        aria-label="Kêu gọi hành động"
      >
        {/* Abstract background elements - simplified for performance */}
        <div className="absolute inset-0 bg-blue-600" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-blue-50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Tham gia cộng đồng du lịch lớn nhất Việt Nam. Chia sẻ trải nghiệm
            của bạn và nhận những phần quà hấp dẫn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto min-w-[200px]"
            >
              Đăng ký ngay
            </Link>
            <Link
              href="/about"
              className="px-10 py-4 bg-blue-700/50 text-white border border-blue-400/30 rounded-full font-bold hover:bg-blue-700 transition-all w-full sm:w-auto min-w-[200px] backdrop-blur-sm"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
