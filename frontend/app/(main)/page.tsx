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

const iconMap: Record<string, JSX.Element> = {
  utensils: <FaUtensils />,
  hotel: <FaHotel />,
  map: <FaMapMarkerAlt />,
  camera: <FaMap />,
  bed: <FaHotel />,
  coffee: <FaUtensils />,
};

const resolveIcon = (iconStr: string) => {
  return iconMap[iconStr] || <FaMapMarkerAlt />;
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
  const { data: categoriesData } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData?.items || [];

  // Fetch Cities
  const { data: citiesData, isLoading: isCitiesLoading } = useQuery({
    queryKey: ["home-cities"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/cities", {
        params: { limit: 4, page: 1 },
      });
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Fetch Featured Locations
  const { data: locationsData, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["home-locations"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/locations", {
        params: { limit: 8, page: 1, includeRatings: "1" }, // Request ratings
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-sm font-semibold mb-6 backdrop-blur-md">
              Chào mừng đến với Việt Nam
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-tight">
              Khám phá vẻ đẹp <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Việt Nam
              </span>{" "}
              bất tận
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl mx-auto font-light">
              Hàng ngàn địa điểm du lịch, ẩm thực và văn hóa đang chờ bạn khám
              phá. Kết nối và chia sẻ hành trình của bạn ngay hôm nay.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-2 border border-white/20"
            >
              <div className="flex-1 flex items-center px-6 w-full md:w-auto h-14 bg-white rounded-full transition-all focus-within:ring-2 focus-within:ring-blue-400 shadow-inner">
                <FaSearch className="text-gray-400 mr-3 text-lg" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bạn muốn đi đâu hôm nay?"
                  className="bg-transparent outline-none w-full text-gray-800 placeholder-gray-400 text-base font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-10 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <FaSearch /> Tìm kiếm
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-300 font-medium">
              <span className="hidden md:inline">Gợi ý:</span>
              <Link
                href="/tim-kiem?q=Đà%20Nẵng"
                className="hover:text-white underline decoration-blue-400 underline-offset-4 decoration-2"
              >
                Đà Nẵng
              </Link>
              <Link
                href="/tim-kiem?q=Hà%20Nội"
                className="hover:text-white underline decoration-pink-400 underline-offset-4 decoration-2"
              >
                Hà Nội
              </Link>
              <Link
                href="/tim-kiem?q=Hội%20An"
                className="hover:text-white underline decoration-yellow-400 underline-offset-4 decoration-2"
              >
                Hội An
              </Link>
              <Link
                href="/tim-kiem?q=Phú%20Quốc"
                className="hover:text-white underline decoration-emerald-400 underline-offset-4 decoration-2"
              >
                Phú Quốc
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat: any, idx: number) => (
              <Link
                href={`/tim-kiem?category=${encodeURIComponent(cat.name)}`}
                key={cat._id || idx}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl cursor-pointer border border-gray-100 flex flex-col items-center gap-5 transition-all h-full"
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl text-blue-600 bg-blue-50 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {resolveIcon(cat.icon)}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {cat.name}
                  </h3>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">
                Điểm đến hàng đầu
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                Thành phố nổi tiếng
              </h2>
            </div>
            <Link
              href="/kham-pha"
              className="text-gray-600 font-semibold flex items-center gap-2 hover:text-blue-600 transition-colors bg-gray-100 px-5 py-2.5 rounded-full hover:bg-blue-50"
            >
              Xem tất cả <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {isCitiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-100 rounded-3xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCities.map((city: any) => (
                <Link
                  href={`/thanh-pho/${city._id}`}
                  key={city._id}
                  className="group block h-full"
                >
                  <div className="relative h-96 rounded-3xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gray-200">
                      {city.imageUrl ? (
                        <Image
                          src={city.imageUrl}
                          alt={city.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
                        {city.region}
                      </p>
                      <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
                      <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                        {stripHtml(city.description) ||
                          "Khám phá vẻ đẹp và văn hóa đặc sắc..."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3 block">
              Gợi ý cho bạn
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Địa điểm đang được yêu thích
            </h2>
            <p className="text-gray-500 text-lg">
              Những địa điểm du lịch, ăn uống và vui chơi được cộng đồng đánh
              giá cao nhất trong tuần qua.
            </p>
          </div>

          {isLocationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-white rounded-3xl border border-gray-100 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredLocations.map((loc: any) => (
                <Link
                  href={`/dia-diem/${loc._id}`}
                  key={loc._id}
                  className="group h-full flex flex-col"
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-56 w-full overflow-hidden">
                      {loc.imageUrl ? (
                        <Image
                          src={loc.imageUrl}
                          alt={loc.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-md text-gray-800 flex items-center gap-1">
                        <FaStar className="text-amber-400" />{" "}
                        {loc.ratingAvg ? loc.ratingAvg.toFixed(1) : "New"}
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase shadow-md">
                        {loc.category}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {loc.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <FaMapMarkerAlt className="text-blue-500 shrink-0" />
                          <span className="line-clamp-1">{loc.province}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {stripHtml(loc.description) ||
                            "Một địa điểm tuyệt vời để khám phá..."}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>Đã cập nhật mới</span>
                        <span className="text-blue-600 group-hover:underline">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/kham-pha"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-gray-800 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-lg"
            >
              Khám phá kho tàng địa điểm <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-[128px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-30 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Bạn đã sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Tham gia cộng đồng du lịch lớn nhất Việt Nam, chia sẻ hành trình của
            bạn và nhận những ưu đãi độc quyền.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
            >
              Đăng ký ngay
            </Link>
            <Link
              href="/about"
              className="px-10 py-4 bg-blue-700 text-white border border-blue-500 rounded-full font-bold hover:bg-blue-800 transition-all w-full sm:w-auto"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
