"use client";

import {
  FaTrash,
  FaCheck,
  FaSearch,
  FaFilter,
  FaStar,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function AdminCommentsPage() {
  const comments = [
    {
      id: 1,
      user: "Trần Văn B",
      avatar: "bg-blue-200",
      email: "vnb@example.com",
      rating: 4,
      content: "Dịch vụ ở đây quá tệ, lừa đảo khách hàng...",
      location: "Chợ Bến Thành",
      status: "reported",
      reportCount: 8,
      date: "10/05/2026",
    },
    {
      id: 2,
      user: "Lê Thị C",
      avatar: "bg-green-200",
      email: "lethic@gmail.com",
      rating: 5,
      content: "Khung cảnh ở đây thật tuyệt vời, nhất định sẽ quay lại!",
      location: "Vịnh Hạ Long",
      status: "clean",
      reportCount: 0,
      date: "09/05/2026",
    },
    {
      id: 3,
      user: "Phạm Minh D",
      avatar: "bg-purple-200",
      email: "pmd_9x@vmail.com",
      rating: 3,
      content: "Nhân viên phục vụ hơi chậm, đồ ăn tạm ổn.",
      location: "Bà Nà Hills",
      status: "reported",
      reportCount: 2,
      date: "08/05/2026",
    },
    {
      id: 4,
      user: "Ẩn danh",
      avatar: "bg-gray-200",
      email: "anonymous@user.com",
      rating: 1,
      content: "Spam content [Link lừa đảo...]",
      location: "Phố Cổ Hội An",
      status: "reported",
      reportCount: 15,
      date: "07/05/2026",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Bình luận & Đánh giá
          </h1>
          <p className="text-gray-500">
            Kiểm duyệt ý kiến người dùng và xử lý báo cáo vi phạm.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center gap-2">
          Xuất báo cáo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Tổng bình luận
          </h3>
          <div className="text-3xl font-bold text-gray-800">12,482</div>
          <div className="text-green-500 text-xs font-bold mt-1">
            +12% so với tháng trước
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Báo cáo mới
          </h3>
          <div className="text-3xl font-bold text-red-600">24</div>
          <div className="text-red-500 text-xs font-bold mt-1">
            Cần xử lý ngay
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Đánh giá trung bình
          </h3>
          <div className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
            4.8/5.0 <FaStar size={20} />
          </div>
          <div className="text-gray-400 text-xs font-bold mt-1">
            Dựa trên 8.2k lượt đánh giá
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">
            Tỷ lệ phản hồi
          </h3>
          <div className="text-3xl font-bold text-gray-800">94%</div>
          <div className="text-green-500 text-xs font-bold mt-1">
            Thời gian trung bình: 15p
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo người dùng hoặc địa điểm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            Số lượng báo cáo
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            Số sao đánh giá
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200">
            <FaFilter /> Bộ lọc khác
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Đánh giá</th>
              <th className="px-6 py-4 w-1/3">Nội dung bình luận</th>
              <th className="px-6 py-4">Địa điểm</th>
              <th className="px-6 py-4">Báo cáo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <tr
                key={comment.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${comment.avatar} flex items-center justify-center font-bold text-gray-700`}
                    >
                      {comment.user.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {comment.user}
                      </h4>
                      <p className="text-xs text-gray-500">{comment.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < comment.rating ? "" : "text-gray-300"}
                        size={12}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 italic">
                  "{comment.content}"
                </td>
                <td className="px-6 py-4 text-blue-600 font-medium cursor-pointer hover:underline">
                  {comment.location}
                </td>
                <td className="px-6 py-4">
                  {comment.reportCount > 0 ? (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                      {comment.reportCount} Báo cáo
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded text-xs font-bold">
                      0 Báo cáo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button
                      className="hover:text-green-500 transition-colors"
                      title="Chấp nhận / Bỏ qua"
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="hover:text-orange-500 transition-colors"
                      title="Cảnh báo"
                    >
                      <FaExclamationTriangle />
                    </button>
                    <button
                      className="hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bulk Actions */}
        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center rounded-b-xl mx-4 mb-4 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
              3 ĐÃ CHỌN
            </span>
            <span className="text-sm">
              Đang chọn nhiều mục để xử lý hàng loạt
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-sm font-bold">
              Hủy chọn
            </button>
            <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-sm font-bold flex items-center gap-2">
              <FaTrash size={12} /> Xóa tất cả
            </button>
            <button className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 text-sm font-bold flex items-center gap-2">
              <FaCheck size={12} /> Duyệt tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
