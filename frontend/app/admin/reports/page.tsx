"use client";

import {
  FaExclamationCircle,
  FaUserShield,
  FaBan,
  FaCheck,
  FaEye,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";

export default function AdminReportsPage() {
  const reports = [
    {
      id: "Rpt-001",
      targetType: "Bình luận",
      targetName: "Bình luận tại 'Chợ Bến Thành'",
      reporter: "user123",
      reason: "Ngôn từ đả kích, thù địch",
      date: "14/05/2026 14:30",
      status: "pending",
      severity: "high",
    },
    {
      id: "Rpt-002",
      targetType: "Địa điểm",
      targetName: "Massage ABC",
      reporter: "local_guide_99",
      reason: "Địa điểm không tồn tại / Lừa đảo",
      date: "14/05/2026 10:15",
      status: "pending",
      severity: "critical",
    },
    {
      id: "Rpt-003",
      targetType: "Người dùng",
      targetName: "spam_bot_01",
      reporter: "admin_he_thong",
      reason: "Spam link quảng cáo hàng loạt",
      date: "13/05/2026 09:00",
      status: "resolved",
      severity: "medium",
    },
    {
      id: "Rpt-004",
      targetType: "Bài viết",
      targetName: "Review sai sự thật...",
      reporter: "chu_quan_cafe",
      reason: "Thông tin sai lệch ảnh hưởng kinh doanh",
      date: "12/05/2026 16:45",
      status: "pending",
      severity: "medium",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-6 flex items-start gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <FaExclamationCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-700">
            Trung tâm xử lý vi phạm
          </h2>
          <p className="text-red-500/80 text-sm mt-1">
            Hãy xử lý các báo cáo một cách công bằng và minh bạch. Các hành động
            Ban/Xóa sẽ được ghi log lại hệ thống.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Danh sách báo cáo ({reports.length})
        </h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <FaFilter /> Lọc theo loại
          </button>
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <FaSortAmountDown /> Mới nhất
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((rpt) => (
          <div
            key={rpt.id}
            className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${rpt.status === "resolved" ? "border-l-green-500 opacity-60" : "border-l-red-500"} flex flex-col md:flex-row gap-6 md:items-center`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    rpt.severity === "critical"
                      ? "bg-red-600 text-white"
                      : rpt.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                  }`}
                >
                  Độ nghiêm trọng: {rpt.severity}
                </span>
                <span className="text-xs text-gray-400">ID: {rpt.id}</span>
                <span className="text-xs text-gray-400"> • {rpt.date}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                {rpt.targetName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">
                  {rpt.targetType}
                </span>
                <span>
                  bị báo cáo bởi{" "}
                  <strong className="text-blue-600">{rpt.reporter}</strong>
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                "Lý do: {rpt.reason}"
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
              {rpt.status === "pending" ? (
                <>
                  <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 flex items-center justify-center gap-2">
                    <FaEye /> Xem chi tiết
                  </button>
                  <button className="w-full py-2 bg-white border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2">
                    <FaBan /> Xử lý vi phạm
                  </button>
                  <button className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-medium underline">
                    Bỏ qua báo cáo này
                  </button>
                </>
              ) : (
                <div className="text-center text-green-600 font-bold flex flex-col items-center">
                  <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <FaCheck />
                  </span>
                  <span>Đã giải quyết</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
