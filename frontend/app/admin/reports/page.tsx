"use client";

import {
  FaExclamationCircle,
  FaBan,
  FaCheck,
  FaEye,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reports", page, statusFilter, severityFilter],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/admin/reports", {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.accessToken,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      action,
    }: {
      id: string;
      status: string;
      action?: string;
    }) => {
      return axios.patch(
        `http://localhost:5000/api/admin/reports/${id}`,
        { status, action },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Đã cập nhật báo cáo");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  const reports = data?.items || [];

  const severityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Nghiêm trọng";
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      default:
        return "Thấp";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-6 flex items-start gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <FaExclamationCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-700">Trung tâm Báo cáo</h2>
          <p className="text-red-500/80 text-sm mt-1">
            Xử lý các báo cáo vi phạm từ người dùng. Tất cả hành động đều được
            ghi lại.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Danh sách báo cáo ({data?.pagination?.total || 0})
        </h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="ignored">Đã bỏ qua</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-blue-500"
          >
            <option value="">Tất cả mức độ</option>
            <option value="critical">Nghiêm trọng</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-center py-10">
          Đang tải báo cáo...
        </div>
      ) : isError ? (
        <div className="text-red-500 text-center py-10">
          Lỗi khi tải dữ liệu.
        </div>
      ) : reports.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          Chưa có báo cáo nào.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rpt: any) => (
            <div
              key={rpt._id}
              onClick={() => router.push(`/admin/reports/${rpt._id}`)}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${rpt.status === "resolved" ? "border-l-green-500 opacity-60" : rpt.status === "ignored" ? "border-l-gray-300 opacity-60" : "border-l-red-500"} flex flex-col md:flex-row gap-6 md:items-center cursor-pointer hover:bg-gray-50 transition-all`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityBadge(rpt.severity)}`}
                  >
                    {getSeverityLabel(rpt.severity)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ID: {rpt._id.slice(-6)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(rpt.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  Đang báo cáo: {rpt.targetName || "Đối tượng không xác định"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase text-gray-500 border border-gray-200">
                    {rpt.targetType}
                  </span>
                  <span>
                    bởi{" "}
                    <strong className="text-blue-600">
                      {rpt.reporter?.name ||
                        rpt.reporterName ||
                        "Người dùng ẩn danh"}
                    </strong>
                  </span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 italic border border-red-100">
                  "{rpt.reason}"
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
                {rpt.status === "pending" ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/reports/${rpt._id}`);
                      }}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <FaEye /> Xem chi tiết
                    </button>
                    <button
                      className="w-full py-2 bg-white border border-green-200 text-green-600 rounded-lg font-bold text-sm hover:bg-green-50 flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMutation.mutate({
                          id: rpt._id,
                          status: "resolved",
                          action: "Xử lý nhanh",
                        });
                      }}
                    >
                      <FaCheck /> Đã xử lý
                    </button>
                  </>
                ) : (
                  <div className="text-center text-green-600 font-bold flex flex-col items-center">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${rpt.status === "ignored" ? "bg-gray-100 text-gray-500" : "bg-green-100"}`}
                    >
                      {rpt.status === "ignored" ? <FaBan /> : <FaCheck />}
                    </span>
                    <span
                      className={
                        rpt.status === "ignored" ? "text-gray-500" : ""
                      }
                    >
                      {rpt.status === "ignored" ? "Đã bỏ qua" : "Đã giải quyết"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 flex justify-between items-center text-sm text-gray-500">
        <span>
          Trang {data?.pagination?.page || 1} /{" "}
          {data?.pagination?.totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            disabled={page >= (data?.pagination?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
