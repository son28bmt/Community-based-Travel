"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaSearch } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const regionFilters = [
  { id: "all", label: "Tất cả" },
  { id: "north", label: "Miền Bắc" },
  { id: "central", label: "Miền Trung" },
  { id: "south", label: "Miền Nam" },
];

const regionLabelMap: Record<string, string> = {
  "mien bac": "north",
  "mien trung": "central",
  "mien nam": "south",
};

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

export default function DiscoveryPage() {
  const [region, setRegion] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-locations", search],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/locations`, {
        params: {
          page: 1,
          limit: 20,
          search: search || undefined,
        },
      });
      return res.data;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["public-cities"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/cities`, {
        params: { page: 1, limit: 100 },
      });
      return res.data;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  const items = data?.items || [];
  const cityRegionMap = useMemo(() => {
    const map: Record<string, string> = {};
    (citiesData?.items || []).forEach((city: any) => {
      const regionKey = regionLabelMap[normalizeText(city.region)] || "other";
      map[normalizeText(city.name)] = regionKey;
    });
    return map;
  }, [citiesData]);

  const nearbyCities = (citiesData?.items || []).slice(0, 4);

  const popularLocations = useMemo(() => {
    let list = items;
    if (region !== "all") {
      list = items.filter(
        (item: any) => cityRegionMap[normalizeText(item.province)] === region
      );
    }
    return list.slice(0, 8);
  }, [items, region, cityRegionMap]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  return (
    <main className="relative bg-slate-50 overflow-hidden min-h-screen">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-blue-200/50 blur-3xl opacity-50"></div>
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl opacity-50"></div>

      <div className="container mx-auto px-4 pb-20 pt-24 relative z-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-2 mb-8 animate-fade-in">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Khám phá</span>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600 font-medium">
            Chọn Tỉnh / Thành Phố
          </span>
        </nav>

        {/* Header Section */}
        <header className="max-w-3xl mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Khám phá <span className="text-blue-600">Việt Nam</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Từ những đỉnh núi phía Bắc hùng vĩ đến những bãi biển miền Trung
            nắng gió và vùng sông nước miền Tây hiền hòa.
          </p>

          <div className="relative group max-w-lg">
            <label htmlFor="search-locations" className="sr-only">
              Tìm kiếm địa điểm
            </label>
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              id="search-locations"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tỉnh/thành, điểm đến hấp dẫn..."
              className="w-full rounded-full border border-gray-200 bg-white pl-12 pr-6 py-3.5 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
            />
          </div>
        </header>

        {/* Featured Cities */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-blue-500 block"></span>
              Thành Phố Nổi Bật
            </h2>
            <Link
              href="#popular"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 decoration-2"
            >
              Xem tất cả
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-48 rounded-2xl bg-white border border-gray-100 animate-pulse"
                ></div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 text-red-600">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {nearbyCities.map((city: any) => (
                <Link
                  key={city._id}
                  href={`/thanh-pho/${city._id}`}
                  className="group block relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {city.imageUrl ? (
                    <Image
                      src={city.imageUrl}
                      alt={city.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized={!city.imageUrl.startsWith("/")}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-300">
                      <FaMapMarkerAlt size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold">{city.name}</h3>
                    <p className="text-xs text-white/90 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {city.region}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Popular Destinations Filter & Grid */}
        <section id="popular" className="mb-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-indigo-500 block"></span>
              Điểm đến phổ biến
            </h2>

            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm w-fit">
              {regionFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setRegion(filter.id)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    region === filter.id
                      ? "bg-indigo-600 text-white shadow-md transform scale-105"
                      : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  aria-pressed={region === filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {popularLocations.length > 0 ? (
                popularLocations.map((item: any) => (
                  <Link
                    key={item._id}
                    href={`/dia-diem/${item._id}`}
                    className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized={!item.imageUrl.startsWith("/")}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                          <FaMapMarkerAlt size={48} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 text-gray-800">
                        <FaStar className="text-amber-400" /> 4.5
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {stripHtml(item.description) ||
                          "Một điểm đến tuyệt vời đang chờ bạn khám phá."}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <FaMapMarkerAlt />
                        <span className="truncate">{item.province}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p>Không tìm thấy địa điểm nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-12">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                Bạn chưa tìm thấy nơi mình muốn đến?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Chúng tôi có danh sách hơn 63 tỉnh thành với hàng ngàn cộng đồng
                địa phương sẵn sàng chào đón bạn.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="#popular"
                  onClick={() => setRegion("all")}
                  className="px-8 py-3.5 rounded-full bg-white text-blue-600 font-bold hover:bg-blue-50 hover:shadow-lg transition-all active:scale-95 w-full sm:w-auto"
                >
                  Khám phá tất cả
                </Link>
                <Link
                  href="/cong-dong"
                  className="px-8 py-3.5 rounded-full bg-blue-800/50 text-white font-bold border border-white/20 hover:bg-blue-800 transition-all active:scale-95 w-full sm:w-auto backdrop-blur-sm"
                >
                  Đóng góp địa điểm
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
