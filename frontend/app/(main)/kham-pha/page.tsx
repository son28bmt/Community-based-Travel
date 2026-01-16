"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      const res = await axios.get("http://localhost:5000/api/locations", {
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
      const res = await axios.get("http://localhost:5000/api/cities", {
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
    <div className="relative bg-slate-50 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-blue-200/50 blur-3xl"></div>
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"></div>

      <div className="container mx-auto px-4 pb-20 pt-24 relative">
        <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Khám phá</span>
          <span>/</span>
          <span className="text-blue-600 font-semibold">
            Chọn Tỉnh / Thành Phố
          </span>
        </div>

        <div className="mt-6 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Khám phá Việt Nam
          </h1>
          <p className="mt-3 text-gray-600">
            Từ những đỉnh núi phía Bắc hùng vĩ đến những bãi biển miền Trung
            nắng gió và vùng sông nước miền Tây hiền hòa.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tỉnh/thành, địa điểm..."
              className="w-full sm:w-80 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
            {/* <span className="text-xs text-gray-400">Tự cập nhật mỗi 30s</span> */}
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              Thành Phố Nổi Bật
            </div>
            <Link
              href="#popular"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Xem thêm
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse"
                ></div>
              ))}
            </div>
          ) : isError ? (
            <div className="mt-4 text-red-500 text-sm">
              Có lỗi khi tải dữ liệu khám phá.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyCities.map((city: any) => (
                <Link
                  key={city._id}
                  href={`/thanh-pho/${city._id}`}
                  className="group"
                >
                  <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm border border-white/70">
                    {city.imageUrl ? (
                      <Image
                        src={city.imageUrl}
                        alt={city.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-slate-200 to-slate-100"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-sm font-semibold">{city.name}</div>
                      <div className="text-xs text-white/80">{city.region}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="popular" className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              Điểm đến phổ biến
            </div>
            <div className="flex items-center gap-2">
              {regionFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setRegion(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    region === filter.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularLocations.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/dia-diem/${item._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="relative h-44 bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-slate-200 to-slate-100"></div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                          <FaStar className="text-amber-400" />
                          4.5
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {stripHtml(item.description) ||
                          "Điểm đến nổi bật được cộng đồng đánh giá cao."}
                      </p>
                      <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <FaMapMarkerAlt />
                        {item.province}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border border-blue-100 p-8 text-center shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Bạn chưa tìm thấy nơi mình muốn đến?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chúng tôi có danh sách hơn 63 tỉnh thành với hàng ngàn cộng đồng
              địa phương sẵn sàng chào đón bạn.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#popular"
                className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                Xem tất cả 63 tỉnh thành
              </Link>
              <Link
                href="/cong-dong"
                className="px-5 py-2 rounded-full bg-white text-blue-600 text-sm font-semibold border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Yêu cầu thêm mới
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
