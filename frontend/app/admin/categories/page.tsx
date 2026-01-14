"use client";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaEllipsisV,
  FaUtensils,
  FaHotel,
  FaMapMarkedAlt,
  FaCamera,
  FaBed,
  FaCoffee,
} from "react-icons/fa";

export default function AdminCategoriesPage() {
  const categories = [
    {
      id: 1,
      name: "Ăn uống",
      description: "Nhà hàng, quán ăn, ẩm thực đường phố",
      icon: <FaUtensils className="text-blue-500" />,
      count: 124,
      status: "active",
      subCategories: [
        { name: "Hải sản tươi sống", status: "pending" },
        { name: "Món ăn đường phố", status: "active" },
        { name: "Nhà hàng chay", status: "active" },
      ],
    },
    {
      id: 2,
      name: "Lưu trú",
      description: "Khách sạn, homestay, resort nghỉ dưỡng",
      icon: <FaBed className="text-blue-500" />,
      count: 450,
      status: "active",
      subCategories: [
        { name: "Khách sạn 5 sao", status: "active" },
        { name: "Homestay & Villa", status: "active" },
      ],
    },
    {
      id: 3,
      name: "Điểm tham quan",
      description: "Danh lam thắng cảnh, di tích lịch sử",
      icon: <FaMapMarkedAlt className="text-blue-500" />,
      count: 890,
      status: "active",
      subCategories: [
        { name: "Di tích lịch sử", status: "active" },
        { name: "Danh lam thắng cảnh", status: "active" },
      ],
    },
    {
      id: 4,
      name: "Check-in & Sống ảo",
      description: "Các địa điểm đẹp để chụp ảnh",
      icon: <FaCamera className="text-blue-500" />,
      count: 230,
      status: "hidden",
      subCategories: [],
    },
    {
      id: 5,
      name: "Cà phê & Tráng miệng",
      description: "Quán cafe, tiệm bánh, trà sữa",
      icon: <FaCoffee className="text-blue-500" />,
      count: 560,
      status: "active",
      subCategories: [],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 px-4">
          Quản lý Danh mục
        </h1>
        <div className="flex-1 max-w-xl mx-8 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <button className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 flex items-center gap-2 shadow-lg shadow-blue-200">
          <FaPlus /> Thêm Danh Mục Mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Cấu trúc danh mục
          </h2>
          <p className="text-gray-500 mb-8">
            Quản lý phân cấp danh mục chính và danh mục con cho toàn bộ hệ thống
            du lịch.
          </p>

          <div className="flex items-center gap-8 mb-6 text-sm font-medium text-gray-500">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-dashed border-blue-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors">
              <FaPlus className="text-blue-500" />
              <span className="text-[10px] text-blue-600">Thêm mới</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors">
              <FaEllipsisV className="text-gray-400" />
              <span className="text-[10px] text-gray-500">Gộp danh mục</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors">
              <FaEye className="text-gray-400" />
              <span className="text-[10px] text-gray-500">Hiện tất cả</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-red-100 transition-colors">
              <FaTrash className="text-red-400" />
              <span className="text-[10px] text-red-500">Xóa mục chọn</span>
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Parent Category Header */}
                <div className="bg-white p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <span className="text-gray-300 cursor-move">⋮⋮</span>
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {cat.subCategories.length} danh mục con · {cat.count} địa
                      điểm
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${cat.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {cat.status === "active" ? "Công khai" : "Ẩn"}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <FaEdit className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-full">
                      <FaTrash className="text-red-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.subCategories.length > 0 && (
                  <div className="bg-gray-50 p-4 pl-16 space-y-2 border-t border-gray-100">
                    {cat.subCategories.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 py-2 px-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all group"
                      >
                        <span className="text-gray-300 cursor-move text-xs">
                          ⋮⋮
                        </span>
                        <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                        <span className="font-medium text-gray-700 flex-1">
                          {sub.name}
                        </span>

                        <div className="flex items-center gap-2">
                          {sub.status === "pending" ? (
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Chờ duyệt
                            </span>
                          ) : (
                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Hiển thị
                            </span>
                          )}
                          <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 group-hover:text-gray-600">
                            <FaEdit size={12} />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 group-hover:text-gray-600">
                            {sub.status === "active" ? (
                              <FaEye size={12} />
                            ) : (
                              <FaEyeSlash size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
