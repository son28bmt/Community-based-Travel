"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "use-debounce"; // We can install this or implement custom

const ratingOptions = [
  { label: "Từ 4 sao trở lên", value: "4" },
  { label: "Từ 3 sao trở lên", value: "3" },
  { label: "Từ 2 sao trở lên", value: "2" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial state from URL
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialProvince = searchParams.get("province") || "";
  const initialRating = searchParams.get("ratingMin") || "";
  const initialSort = searchParams.get("sort") || "relevant";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearch] = useDebounce(searchInput, 500);

  const [category, setCategory] = useState(initialCategory);
  const [province, setProvince] = useState(initialProvince);
  const [ratingMin, setRatingMin] = useState(initialRating);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (ratingMin) params.set("ratingMin", ratingMin);
    if (sort && sort !== "relevant") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());

    router.replace(`/tim-kiem?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, category, province, ratingMin, sort, page, router]);

  // Fetch Cities
  const { data: citiesData } = useQuery({
    queryKey: ["search-cities"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/cities", {
        params: { limit: 100, page: 1 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["search-categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Locations (Realtime)
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: [
      "search-locations",
      debouncedSearch,
      category,
      province,
      ratingMin,
      sort,
      page,
    ],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/locations", {
        params: {
          search: debouncedSearch || undefined,
          category: category || undefined,
          province: province || undefined,
          ratingMin: ratingMin || undefined,
          includeRatings: 1,
          sort:
            sort === "rating"
              ? "rating"
              : sort === "newest"
                ? "newest"
                : undefined,
          page,
          limit: 9,
        },
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData, // keepPreviousData logic
  });

  const locations = data?.items || [];
  const pagination = data?.pagination;

  // Helper to remove tones (Client side version)
  const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    return str;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Smart Parsing Logic
    if (citiesData?.items && categoriesData?.items) {
      let newSearch = searchInput;
      let newProvince = province;
      let newCategory = category;
      const searchNormalized = removeVietnameseTones(newSearch).toLowerCase();

      // 1. Detect Province if not set
      if (!newProvince) {
        for (const city of citiesData.items) {
          const cityNormalized = removeVietnameseTones(city.name).toLowerCase();
          // Match "tai da nang", "o da nang", or just "da nang" if word boundary
          if (
            new RegExp(`\\b${cityNormalized}\\b`, "i").test(searchNormalized)
          ) {
            newProvince = city.name;
            const regex = new RegExp(
              `\\b${removeVietnameseTones(city.name)}\\b`,
              "gi"
            );
            newSearch = removeVietnameseTones(newSearch)
              .replace(regex, "")
              .trim();
            break;
          }
        }
      }

      // 2. Detect Category if not set
      if (!newCategory) {
        for (const cat of categoriesData.items) {
          const catNormalized = removeVietnameseTones(cat.name).toLowerCase();
          if (
            new RegExp(`\\b${catNormalized}\\b`, "i").test(searchNormalized)
          ) {
            newCategory = cat.name;
            const regex = new RegExp(
              `\\b${removeVietnameseTones(cat.name)}\\b`,
              "gi"
            );
            newSearch = removeVietnameseTones(newSearch)
              .replace(regex, "")
              .trim();
            break;
          }
        }
      }

      // 3. Cleanup
      newSearch = newSearch
        .replace(/\b(tại|ở|trong|khu vực|tai|o|khu vuc)\b/gi, "")
        .trim();
      newSearch = newSearch.replace(/\s+/g, " ").trim();

      if (
        newProvince !== province ||
        newCategory !== category ||
        newSearch !== searchInput
      ) {
        setProvince(newProvince);
        setCategory(newCategory);
        setSearchInput(newSearch);
        setPage(1);
      }
    }
  };

  const resultSummary = useMemo(() => {
    const total = pagination?.total || 0;
    if (!debouncedSearch) return `Tìm thấy ${total} địa điểm`;
    return `Tìm thấy ${total} kết quả cho "${debouncedSearch}"`;
  }, [pagination?.total, debouncedSearch]);

  const displayCities = useMemo(() => {
    if (!citiesData?.items) return [];

    // 1. If user explicitly filtered by province, show that city
    if (province) {
      return citiesData.items.filter((c: any) => c.name === province);
    }

    // 2. If user is searching (e.g. "Đà Nẵng")
    if (debouncedSearch) {
      const searchNormalized =
        removeVietnameseTones(debouncedSearch).toLowerCase();
      return citiesData.items.filter((c: any) => {
        const cityNameNormalized = removeVietnameseTones(c.name).toLowerCase();
        return (
          cityNameNormalized.includes(searchNormalized) ||
          searchNormalized.includes(cityNameNormalized)
        );
      });
    }

    // 3. If no search & no filter (Empty search), show all (or limited set)
    // User requested: "search empty -> show cities"
    return citiesData.items.slice(0, 8); // Show top 8 cities if empty
  }, [citiesData, province, debouncedSearch]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2 hover:shadow-md transition-shadow">
            <FaSearch className="text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
              placeholder="Tìm kiếm địa điểm, món ăn, thành phố..."
              className="flex-1 outline-none text-sm py-2 text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6 h-fit sticky top-24">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">
                Bộ lọc nâng cao
              </h3>
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    Danh mục
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categoriesData?.items?.map((cat: any) => (
                      <label
                        key={cat._id}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.name}
                          checked={category === cat.name}
                          onChange={() => {
                            setCategory(cat.name);
                            setPage(1);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                    {category && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("");
                          setPage(1);
                        }}
                        className="text-xs text-red-500 font-semibold mt-2 hover:underline"
                      >
                        Xóa lọc danh mục
                      </button>
                    )}
                  </div>
                </div>

                {/* Province Filter */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    Tỉnh / Thành phố
                  </p>
                  <div className="relative">
                    <select
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Tất cả tỉnh thành</option>
                      {citiesData?.items?.map((city: any) => (
                        <option key={city._id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    Đánh giá
                  </p>
                  <div className="space-y-2">
                    {ratingOptions.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={item.value}
                          checked={ratingMin === item.value}
                          onChange={() => {
                            setRatingMin(item.value);
                            setPage(1);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                    {ratingMin && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingMin("");
                          setPage(1);
                        }}
                        className="text-xs text-red-500 font-semibold mt-2 hover:underline"
                      >
                        Xóa lọc đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCategory("");
                setProvince("");
                setRatingMin("");
                setPage(1);
                setSearchInput("");
                setSort("relevant");
              }}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </aside>

          <section className="lg:col-span-3">
            {/* City Results Section */}
            {displayCities.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  Khám phá thành phố
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayCities.map((city: any) => (
                    <Link
                      href={`/thanh-pho/${city._id}`}
                      key={city._id}
                      className="group block relative h-40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="absolute inset-0 bg-gray-200">
                        {city.imageUrl ? (
                          <img
                            src={city.imageUrl}
                            alt={city.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : null}
                      </div>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-bold uppercase tracking-wider text-center px-2">
                          {city.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Kết quả tìm kiếm
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isFetching ? "Đang cập nhật..." : resultSummary}
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    sort === "relevant"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSort("relevant")}
                >
                  Phù hợp nhất
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    sort === "rating"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSort("rating")}
                >
                  Đánh giá cao
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    sort === "newest"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSort("newest")}
                >
                  Mới nhất
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500 font-medium">
                  Không thể tải dữ liệu.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Thử lại
                </button>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <FaSearch className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  Không tìm thấy kết quả nào phù hợp.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Hãy thử tìm với từ khóa khác hoặc điều chỉnh bộ lọc.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc: any) => (
                  <Link
                    key={loc._id}
                    href={`/dia-diem/${loc._id}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      {loc.imageUrl ? (
                        <img
                          src={loc.imageUrl}
                          alt={loc.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <FaMapMarkerAlt size={40} />
                        </div>
                      )}
                      {loc.category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                          {loc.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {loc.name}
                        </h3>
                        <span className="shrink-0 flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-500 px-2 py-1 rounded-lg">
                          <FaStar className="text-amber-400" />
                          {(loc.ratingAvg || 0).toFixed(1)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {stripHtml(loc.description) ||
                          "Một điểm đến thú vị để khám phá."}
                      </p>

                      <div className="mt-auto flex items-center gap-2 text-xs text-gray-500 border-t border-gray-50 pt-3">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="line-clamp-1 font-medium text-gray-600">
                          {loc.province || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                <span className="text-sm text-gray-500 font-medium">
                  Hiển thị từ {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  trong số {pagination.total} kết quả
                </span>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        let p = i + 1;
                        if (pagination.totalPages > 5 && page > 3) {
                          p = page - 2 + i;
                        }
                        if (p > pagination.totalPages) return null;
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              setPage(p);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              page === p
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-105"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <button
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={page >= (pagination?.totalPages || 1)}
                    onClick={() => {
                      setPage((prev) => prev + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
