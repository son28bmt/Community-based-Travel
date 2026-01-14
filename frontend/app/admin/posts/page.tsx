"use client";

import {
  FaEdit,
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

export default function AdminPostsPage() {
  const posts = [
    {
      id: "P001",
      title: "Kinh nghiệm du lịch Đà Lạt 3 ngày 2 đêm",
      author: "Nguyễn Văn A",
      category: "Review",
      status: "published",
      views: 1240,
      date: "12/05/2026",
    },
    {
      id: "P002",
      title: "Hỏi đường đi từ Sài Gòn ra Vũng Tàu",
      author: "Trần Thị B",
      category: "Hỏi đáp",
      status: "pending",
      views: 56,
      date: "13/05/2026",
    },
    {
      id: "P003",
      title: "Top 5 quán cà phê đẹp ở Hà Nội",
      author: "Admin",
      category: "Top List",
      status: "published",
      views: 5600,
      date: "10/05/2026",
    },
    {
      id: "P004",
      title: "Cảnh báo lừa đảo ở chợ đêm ABC",
      author: "Lê Văn C",
      category: "Cảnh báo",
      status: "hidden",
      views: 890,
      date: "11/05/2026",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            ● Đã đăng
          </span>
        );
      case "pending":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            ● Chờ duyệt
          </span>
        );
      case "hidden":
        return (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            ● Bị ẩn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h1>
          <p className="text-gray-500">
            Kiểm duyệt và quản lý các bài viết từ cộng đồng.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
          + Viết bài mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
            Tất cả (450)
          </button>
          <button className="px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium relative">
            Chờ duyệt (5)
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">
            Vi phạm
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
            <FaFilter /> Bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Bài viết</th>
              <th className="px-6 py-4">Tác giả</th>
              <th className="px-6 py-4">Chuyên mục</th>
              <th className="px-6 py-4">Lượt xem</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 mb-1 line-clamp-1">
                    {post.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    Đăng ngày: {post.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {post.author}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{post.views}</td>
                <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                <td className="px-6 py-4 text-right">
                  {post.status === "pending" ? (
                    <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 mr-2">
                      Duyệt
                    </button>
                  ) : (
                    <div className="flex justify-end gap-2 text-gray-400">
                      <button className="hover:text-blue-500">
                        <FaEdit />
                      </button>
                      <button className="hover:text-gray-600">
                        <FaEye />
                      </button>
                      <button className="hover:text-red-500">
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
