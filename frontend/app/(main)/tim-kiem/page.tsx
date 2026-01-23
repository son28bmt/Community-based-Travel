"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaFilter,
  FaChevronDown,
  FaRobot,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "use-debounce"; // We can install this or implement custom

const ratingOptions = [
  { label: "Từ 4 sao trở lên", value: "4" },
  { label: "Từ 3 sao trở lên", value: "3" },
  { label: "Từ 2 sao trở lên", value: "2" },
];

function SearchContent() {
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [aiMode, setAiMode] = useState(false);

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
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/cities",
        {
          params: { limit: 100, page: 1 },
        },
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["search-categories"],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/categories",
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Locations (Normal)
  const {
    data: normalData,
    isLoading: isNormalLoading,
    isError: isNormalError,
    isFetching: isNormalFetching,
  } = useQuery({
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
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/locations",
        {
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
        },
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    enabled: !aiMode,
  });

  // Fetch Locations (AI)
  const {
    data: aiData,
    isLoading: isAiLoading,
    isError: isAiError,
    isFetching: isAiFetching,
  } = useQuery({
    queryKey: ["search-ai", debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") +
          "/api/locations/ai-search",
        {
          params: { q: debouncedSearch },
        },
      );
      return res.data;
    },
    enabled: aiMode && !!debouncedSearch,
  });

  const locations = aiMode ? aiData?.items || [] : normalData?.items || [];
  const pagination = aiMode ? null : normalData?.pagination;
  const isLoading = aiMode ? isAiLoading : isNormalLoading;
  const isError = aiMode ? isAiError : isNormalError;
  const isFetching = aiMode ? isAiFetching : isNormalFetching;
  const aiAnalysis = aiData?.analysis;

  // Sync AI Analysis with UI Filters
  useEffect(() => {
    if (aiMode && aiAnalysis) {
      if (aiAnalysis.category) {
        // Check if category exists in validation list (categoriesData)
        const exists = categoriesData?.items?.some(
          (c: any) =>
            c.name.toLowerCase() === aiAnalysis.category.toLowerCase(),
        );
        if (exists) setCategory(aiAnalysis.category);
      }
      if (aiAnalysis.province) {
        const exists = citiesData?.items?.some(
          (c: any) =>
            c.name.toLowerCase() === aiAnalysis.province.toLowerCase(),
        );
        if (exists) setProvince(aiAnalysis.province);
      }
    }
  }, [aiMode, aiAnalysis, categoriesData, citiesData]);

  // Helper to remove tones (Client side version) - MOVED UP for useEffect
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

  // Auto-parse search on mount (for searches from Home page)
  useEffect(() => {
    if (
      !aiMode &&
      debouncedSearch &&
      citiesData?.items &&
      categoriesData?.items
      // Removed !category && !province - allow re-parsing even if filters exist
    ) {
      // Simulate handleSubmit logic
      const searchNormalized =
        removeVietnameseTones(debouncedSearch).toLowerCase();

      const synonymMap: Record<string, string> = {
        "an uong": "Ẩm thực",
        "quan an": "Ẩm thực",
        "nha hang": "Ẩm thực",
        "quan nhau": "Ẩm thực",
        nhau: "Ẩm thực",
        uong: "Ẩm thực",
        cafe: "Ẩm thực",
        "ca phe": "Ẩm thực",
        "luu tru": "Khách sạn",
        "khach san": "Khách sạn",
        resort: "Khách sạn",
        "nghi duong": "Khách sạn",
        homestay: "Khách sạn",
        "tham quan": "Ki Quan",
        checkin: "Checkin",
        "check in": "Checkin",
        "du lich": "Ki Quan",
      };

      let detectedProvince = "";
      let detectedCategory = "";

      // Detect Province
      for (const city of citiesData.items) {
        const cityNormalized = removeVietnameseTones(city.name).toLowerCase();
        if (new RegExp(`\\b${cityNormalized}\\b`, "i").test(searchNormalized)) {
          detectedProvince = city.name;
          break;
        }
      }

      // Detect Category
      for (const cat of categoriesData.items) {
        const catNormalized = removeVietnameseTones(cat.name).toLowerCase();
        if (new RegExp(`\\b${catNormalized}\\b`, "i").test(searchNormalized)) {
          detectedCategory = cat.name;
          break;
        }
      }

      // Synonym match
      if (!detectedCategory) {
        for (const [key, val] of Object.entries(synonymMap)) {
          if (new RegExp(`\\b${key}\\b`, "i").test(searchNormalized)) {
            const realCat = categoriesData.items.find(
              (c: any) =>
                removeVietnameseTones(c.name).toLowerCase() ===
                removeVietnameseTones(val).toLowerCase(),
            );
            if (realCat) {
              detectedCategory = realCat.name;
              break;
            }
          }
        }
      }

      if (detectedProvince || detectedCategory) {
        console.log("Auto-parsed on mount:", {
          detectedCategory,
          detectedProvince,
        });
        if (detectedProvince) setProvince(detectedProvince);
        if (detectedCategory) setCategory(detectedCategory);
      }
    }
  }, [debouncedSearch, citiesData, categoriesData, aiMode, category, province]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Smart Parsing Logic (Only used in Normal Mode)
    if (!aiMode && citiesData?.items && categoriesData?.items) {
      const newSearch = searchInput;
      let newProvince = province;
      let newCategory = category;
      const searchNormalized = removeVietnameseTones(newSearch).toLowerCase();

      // Synonym Maps
      const synonymMap: Record<string, string> = {
        "an uong": "Ẩm thực",
        "quan an": "Ẩm thực",
        "nha hang": "Ẩm thực",
        "quan nhau": "Ẩm thực",
        nhau: "Ẩm thực",
        uong: "Ẩm thực",
        cafe: "Ẩm thực",
        "ca phe": "Ẩm thực",
        "luu tru": "Khách sạn",
        "khach san": "Khách sạn",
        resort: "Khách sạn",
        "nghi duong": "Khách sạn",
        homestay: "Khách sạn",
        "tham quan": "Ki Quan", // Assuming 'Ki Quan' is the category name for sightseeing based on user screenshots
        checkin: "Checkin",
        "check in": "Checkin",
        "du lich": "Ki Quan",
      };

      // 1. Detect Province if not set
      if (!newProvince) {
        for (const city of citiesData.items) {
          const cityNormalized = removeVietnameseTones(city.name).toLowerCase();
          if (
            new RegExp(`\\b${cityNormalized}\\b`, "i").test(searchNormalized)
          ) {
            newProvince = city.name;
            // DON'T strip from search - keep original query
            break;
          }
        }
      }

      // 2. Detect Category (Direct Match + Synonyms) if not set
      if (!newCategory) {
        // Direct Match
        for (const cat of categoriesData.items) {
          const catNormalized = removeVietnameseTones(cat.name).toLowerCase();
          if (
            new RegExp(`\\b${catNormalized}\\b`, "i").test(searchNormalized)
          ) {
            newCategory = cat.name;
            // DON'T strip from search - keep original query
            break;
          }
        }

        // Synonym Match (if still not found)
        if (!newCategory) {
          console.log("Checking synonyms for:", searchNormalized);
          for (const [key, val] of Object.entries(synonymMap)) {
            if (new RegExp(`\\b${key}\\b`, "i").test(searchNormalized)) {
              console.log("Match found:", key, "->", val);
              // Verify the mapped category actually exists in our data
              const realCat = categoriesData.items.find(
                (c: any) =>
                  removeVietnameseTones(c.name).toLowerCase() ===
                  removeVietnameseTones(val).toLowerCase(),
              );

              if (realCat) {
                newCategory = realCat.name;
                // DON'T strip from search - keep original query
              } else {
                console.log("Category not found in DB:", val);
              }
              break;
            }
          }
        }
      }

      console.log("Auto-Filter Result:", {
        newCategory,
        newProvince,
        originalSearch: searchInput,
      });

      // Only update filters, NOT the search text
      if (newProvince !== province || newCategory !== category) {
        setProvince(newProvince);
        setCategory(newCategory);
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
      <div className="container mx-auto px-4 py-4 md:py-8">
        <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 bg-white rounded-full shadow-sm border border-gray-200 px-3 md:px-4 py-2 hover:shadow-md transition-shadow">
            <FaSearch className="text-gray-400 text-sm md:text-base" />
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
              placeholder="Tìm địa điểm, món ăn..."
              className="flex-1 outline-none text-sm py-2 text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setAiMode(!aiMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                aiMode
                  ? "bg-purple-100 text-purple-700 border-purple-200 shadow-inner"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
              title="Bật tìm kiếm thông minh với AI"
            >
              <FaRobot className={aiMode ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">AI Search</span>
            </button>
            <button
              type="submit"
              className={`text-white px-4 md:px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                aiMode
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {aiMode ? "Hỏi AI" : "Tìm"}
            </button>
          </div>
        </form>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaFilter />
            <span>
              Bộ lọc{" "}
              {(category || province || ratingMin) &&
                `(${[category, province, ratingMin].filter(Boolean).length})`}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Desktop Sidebar */}
          <aside
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 space-y-4 md:space-y-6 h-fit  lg:top-24 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 text-xl"
                  aria-label="Đóng bộ lọc"
                >
                  ×
                </button>
              </div>
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <p className="text-sm md:text-base font-bold text-gray-800 mb-3">
                    Danh mục
                  </p>
                  <div className="space-y-2 md:space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categoriesData?.items?.map((cat: any) => (
                      <label
                        key={cat._id}
                        className="flex items-center gap-3 text-sm md:text-base text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-1.5 md:py-0.5"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.name}
                          checked={category === cat.name}
                          onChange={() => {
                            setCategory(cat.name);
                            setPage(1);
                            setShowMobileFilters(false);
                          }}
                          className="w-5 h-5 md:w-4 md:h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                  <p className="text-sm md:text-base font-bold text-gray-800 mb-3">
                    Tỉnh / Thành phố
                  </p>
                  <div className="relative">
                    <select
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setPage(1);
                        setShowMobileFilters(false);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 md:py-2.5 text-sm md:text-base text-gray-700 appearance-none bg-white hover:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
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
                  <p className="text-sm md:text-base font-bold text-gray-800 mb-3">
                    Đánh giá
                  </p>
                  <div className="space-y-2 md:space-y-3">
                    {ratingOptions.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-3 text-sm md:text-base text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-1.5 md:py-0.5"
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={item.value}
                          checked={ratingMin === item.value}
                          onChange={() => {
                            setRatingMin(item.value);
                            setPage(1);
                            setShowMobileFilters(false);
                          }}
                          className="w-5 h-5 md:w-4 md:h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                setShowMobileFilters(false);
              }}
              className="w-full py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm md:text-base font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </aside>

          <section className="lg:col-span-3">
            {/* City Results Section */}
            {displayCities.length > 0 && (
              <div className="mb-6 md:mb-10">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  Khám phá thành phố
                </h2>
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {displayCities.map((city: any) => (
                    <Link
                      href={`/thanh-pho/${city._id}`}
                      key={city._id}
                      className="group block relative h-32 md:h-40 rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
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
                        <h3 className="text-white text-base md:text-2xl font-bold uppercase tracking-wider text-center px-2">
                          {city.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Result */}
            {aiMode && aiAnalysis && (
              <div className="mb-6 bg-purple-50 border border-purple-100 rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-purple-800 font-bold mb-2 flex items-center gap-2">
                  <FaRobot /> Kết quả phân tích AI
                </h2>
                <div className="text-sm text-purple-900 space-y-1">
                  {aiAnalysis.intent && (
                    <p>
                      <span className="font-semibold">Ý định:</span>{" "}
                      {aiAnalysis.intent}
                    </p>
                  )}
                  {aiAnalysis.province && (
                    <p>
                      <span className="font-semibold">Địa điểm:</span>{" "}
                      {aiAnalysis.province}
                    </p>
                  )}
                  {aiAnalysis.category && (
                    <p>
                      <span className="font-semibold">Danh mục:</span>{" "}
                      {aiAnalysis.category}
                    </p>
                  )}
                  {aiAnalysis.keywords && (
                    <p>
                      <span className="font-semibold">Từ khóa:</span>{" "}
                      {aiAnalysis.keywords}
                    </p>
                  )}
                  {aiAnalysis.features && aiAnalysis.features.length > 0 && (
                    <p>
                      <span className="font-semibold">Đặc điểm:</span>{" "}
                      {aiAnalysis.features.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                  Kết quả tìm kiếm
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {isFetching ? "Đang cập nhật..." : resultSummary}
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <button
                  className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
                    sort === "relevant"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSort("relevant")}
                >
                  Phù hợp
                </button>
                <button
                  className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
                    sort === "rating"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSort("rating")}
                >
                  Đánh giá
                </button>
                <button
                  className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
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
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 md:h-80 bg-white rounded-xl md:rounded-2xl border border-gray-100 animate-pulse"
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
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {locations.map((loc: any) => (
                  <Link
                    key={loc._id}
                    href={`/dia-diem/${loc._id}`}
                    className="group bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative h-32 md:h-48 w-full bg-gray-100 overflow-hidden">
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
                        <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-wide shadow-sm">
                          {loc.category}
                        </span>
                      )}
                    </div>
                    <div className="p-2 md:p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-1 md:mb-2 gap-1 md:gap-2">
                        <h3 className="text-xs md:text-base font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {loc.name}
                        </h3>
                        <span className="shrink-0 flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-bold bg-amber-50 text-amber-500 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">
                          <FaStar className="text-amber-400 text-[8px] md:text-xs" />
                          {(loc.ratingAvg || 0).toFixed(1)}
                        </span>
                      </div>

                      <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 mb-2 md:mb-4 hidden md:block">
                        {stripHtml(loc.description) ||
                          "Một điểm đến thú vị để khám phá."}
                      </p>

                      <div className="mt-auto flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-500 border-t border-gray-50 pt-2 md:pt-3">
                        <FaMapMarkerAlt className="text-blue-500 text-[10px] md:text-xs" />
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
                    pagination.total,
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
                      },
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
