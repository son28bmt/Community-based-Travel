"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

const nearbyLocations = [
  {
    name: "Hồ Chí Minh",
    count: "1,240 địa điểm tham quan",
    tag: "PHÍA NAM",
    image:
      "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=1200&q=80",
    slug: "ho-chi-minh",
  },
  {
    name: "Vũng Tàu",
    count: "450 địa điểm tham quan",
    tag: "BIỂN",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    slug: "vung-tau",
  },
  {
    name: "Đà Lạt",
    count: "390 địa điểm tham quan",
    tag: "CAO NGUYÊN",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    slug: "da-lat",
  },
  {
    name: "Phan Thiết",
    count: "320 địa điểm tham quan",
    tag: "BIỂN",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    slug: "phan-thiet",
  },
];

const popularLocations = [
  {
    name: "Hà Nội",
    description: "Vẻ đẹp nghìn năm văn hiến",
    rating: 4.9,
    region: "north",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    slug: "ha-noi",
  },
  {
    name: "Đà Nẵng",
    description: "Thành phố của những cây cầu",
    rating: 4.8,
    region: "central",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    slug: "da-nang",
  },
  {
    name: "Hạ Long",
    description: "Kỳ quan thiên nhiên thế giới",
    rating: 4.9,
    region: "north",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    slug: "ha-long",
  },
  {
    name: "Hội An",
    description: "Nét hoài cổ đậm chất Việt",
    rating: 4.9,
    region: "central",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    slug: "hoi-an",
  },
  {
    name: "Huế",
    description: "Cố đô trầm mặc và cổ kính",
    rating: 4.7,
    region: "central",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    slug: "hue",
  },
  {
    name: "Nha Trang",
    description: "Vịnh biển xanh đẹp hàng đầu",
    rating: 4.6,
    region: "central",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    slug: "nha-trang",
  },
  {
    name: "Sa Pa",
    description: "Vùng cao mờ ảo trong sương",
    rating: 4.8,
    region: "north",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    slug: "sa-pa",
  },
  {
    name: "Phú Quốc",
    description: "Đảo ngọc thiên đường nghỉ dưỡng",
    rating: 4.9,
    region: "south",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    slug: "phu-quoc",
  },
];

const regionFilters = [
  { id: "all", label: "Tất cả" },
  { id: "north", label: "Miền Bắc" },
  { id: "central", label: "Miền Trung" },
  { id: "south", label: "Miền Nam" },
];

export default function DiscoveryPage() {
  const [region, setRegion] = useState("all");

  const filteredPopular = useMemo(() => {
    if (region === "all") return popularLocations;
    return popularLocations.filter((item) => item.region === region);
  }, [region]);

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
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              Gần bạn
            </div>
            <Link
              href="/kham-pha"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Xem thêm
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyLocations.map((item) => (
              <Link
                key={item.slug}
                href={`/dia-diem/${item.slug}`}
                className="group"
              >
                <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm border border-white/70">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-white/80">{item.count}</div>
                  </div>
                  <span className="absolute top-3 right-3 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-gray-700">
                    {item.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
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

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredPopular.map((item) => (
              <Link
                key={item.slug}
                href={`/dia-diem/${item.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="relative h-44 bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <FaStar className="text-amber-400" />
                        {item.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-blue-600">
                      <FaMapMarkerAlt />
                      Xem chi tiết
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border border-blue-100 p-8 text-center shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Bạn chưa tìm thấy nơi mình muốn đến?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chúng tôi có danh sách hơn 63 tỉnh thành với hàng ngàn cộng đồng địa
              phương sẵn sàng chào đón bạn.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
                Xem tất cả 63 tỉnh thành
              </button>
              <button className="px-5 py-2 rounded-full bg-white text-blue-600 text-sm font-semibold border border-blue-200 hover:bg-blue-50 transition-colors">
                Yêu cầu thêm mới
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
