"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaPlane,
  FaHotel,
  FaUtensils,
  FaCamera,
  FaDatabase,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// API Status Component
const ServerStatus = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["serverStatus"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/health");
      return res.data;
    },
    retry: 1,
    refetchInterval: 10000,
  });

  if (isLoading)
    return (
      <span className="text-gray-400 text-xs flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>{" "}
        Connecting...
      </span>
    );
  if (isError)
    return (
      <span className="text-red-500 text-xs flex items-center gap-1 font-bold">
        <FaTimesCircle /> Server Error
      </span>
    );

  return (
    <span className="text-green-600 text-xs flex items-center gap-1 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-200">
      <FaCheckCircle /> {data?.message || "Connected"}
    </span>
  );
};

export default function Home() {
  const categories = [
    {
      name: "Khách sạn",
      icon: <FaHotel />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Ăn uống",
      icon: <FaUtensils />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Tham quan",
      icon: <FaMapMarkerAlt />,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Check-in",
      icon: <FaCamera />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const featured = [
    {
      id: 1,
      name: "Vịnh Hạ Long",
      location: "Quảng Ninh",
      rating: 4.8,
      reviews: 1240,
      image: "bg-blue-200",
      price: "Miễn phí",
    },
    {
      id: 2,
      name: "Phố cổ Hội An",
      location: "Quảng Nam",
      rating: 4.9,
      reviews: 3500,
      image: "bg-yellow-200",
      price: "Miễn phí",
    },
    {
      id: 3,
      name: "Đà Lạt",
      location: "Lâm Đồng",
      rating: 4.7,
      reviews: 2800,
      image: "bg-pink-200",
      price: "Đa dạng",
    },
    {
      id: 4,
      name: "Phú Quốc",
      location: "Kiên Giang",
      rating: 4.8,
      reviews: 1500,
      image: "bg-cyan-200",
      price: "Đa dạng",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Khám phá vẻ đẹp Việt Nam <br /> cùng cộng đồng
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Chia sẻ trải nghiệm, tìm kiếm địa điểm và kết nối với những người
              đam mê du lịch.
            </p>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-full shadow-lg max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center px-4 w-full md:w-auto h-12 bg-gray-50 rounded-full border border-gray-100 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FaSearch className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
                />
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md">
                Tìm kiếm
              </button>
            </div>

            {/* Status Indicator */}
           
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md cursor-pointer border border-gray-100 flex flex-col items-center gap-4 transition-all"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${cat.color}`}
                >
                  {cat.icon}
                </div>
                <h3 className="font-bold text-gray-800">{cat.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Địa điểm hot nhất
              </h2>
              <p className="text-gray-500">
                Được cộng đồng yêu thích và đánh giá cao
              </p>
            </div>
            <Link
              href="/kham-pha"
              className="text-blue-600 font-bold flex items-center gap-2 hover:underline"
            >
              Xem tất cả <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((loc) => (
              <Link href={`/dia-diem/${loc.id}`} key={loc.id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                  <div className={`h-48 w-full ${loc.image} relative`}>
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {loc.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {loc.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        <FaStar /> {loc.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <FaMapMarkerAlt className="text-blue-400" />{" "}
                      {loc.location}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{loc.reviews} đánh giá</span>
                      <span>
                        Bởi <strong>Admin</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
