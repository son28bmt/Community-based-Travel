"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaTrash,
  FaEye,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function AdminReportDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const queryClient = useQueryClient();

  // Fetch report details
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["admin-report", id],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/admin/reports/${id}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );
      return res.data;
    },
    enabled: !!session?.user?.accessToken && !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      status,
      action,
    }: {
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
      queryClient.invalidateQueries({ queryKey: ["admin-report", id] });
      toast.success("Đã cập nhật trạng thái báo cáo");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    },
  });

  // Helper function to resolve target link
  const getTargetLink = (type: string, targetId: string) => {
    switch (type) {
      case "location":
        return `/dia-diem/${targetId}`; // Public link
      case "post":
        return `/bai-viet/${targetId}`; // Assuming public post route
      case "user":
        return `/admin/users/${targetId}`; // Admin user link?
      // Add more cases as needed
      default:
        return "#";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const report = reportData?.report;

  if (!report)
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy báo cáo.
      </div>
    );

  const severityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center gap-1">
            <FaCheckCircle /> Đã xử lý
          </span>
        );
      case "ignored":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold text-sm flex items-center gap-1">
            <FaBan /> Đã bỏ qua
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm flex items-center gap-1">
            <FaExclamationTriangle /> Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Chi tiết báo cáo
            </h1>
            <p className="text-sm text-gray-500">Xem xét và xử lý vi phạm</p>
          </div>
        </div>

        <div className="flex gap-3">
          {report.status === "pending" && (
            <>
              <button
                onClick={() => updateMutation.mutate({ status: "ignored" })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all"
              >
                Bỏ qua
              </button>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    status: "resolved",
                    action: "Đã xử lý thủ công",
                  })
                }
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Đánh dấu đã xử lý
              </button>
            </>
          )}
          {report.status !== "pending" && (
            <button
              onClick={() => updateMutation.mutate({ status: "pending" })}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all"
            >
              Mở lại báo cáo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Report Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg border font-bold text-xs uppercase ${severityColor(report.severity)}`}
                >
                  Mức độ: {report.severity}
                </span>
                {statusBadge(report.status)}
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FaClock /> {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Lý do báo cáo:
            </h2>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 italic mb-6">
              "{report.reason}"
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Đối tượng bị báo cáo
              </h3>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl text-gray-400 shadow-sm">
                  <FaExclamationTriangle />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    {report.targetType}
                  </p>
                  <p className="text-gray-800 font-medium truncate max-w-[200px]">
                    {report.targetName || "Không có tên"}
                  </p>
                  <p className="text-xs text-gray-400">ID: {report.targetId}</p>
                </div>
                <a
                  href={getTargetLink(report.targetType, report.targetId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-all flex items-center gap-2"
                >
                  Xem <FaExternalLinkAlt size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Lịch sử xử lý
            </h3>
            {report.resolvedBy ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Đã xử lý bởi{" "}
                    <span className="text-blue-600">
                      {report.resolvedBy.name}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Hành động: {report.action || "Không có ghi chú"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(report.resolvedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">
                Chưa có ai xử lý báo cáo này.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Reporter Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Người báo cáo
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                <FaUser />
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {report.reporter?.name || report.reporterName || "Ẩn danh"}
                </p>
                <p className="text-sm text-gray-500">
                  {report.reporter?.email ||
                    report.reporterEmail ||
                    "Không có email"}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Báo cáo này được gửi vào lúc{" "}
              {new Date(report.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2">
              Hành động mạnh
            </h3>
            <p className="text-xs text-red-500 mb-4">
              Cẩn thận: Các hành động này không thể hoàn tác.
            </p>

            <button
              className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              title="Tính năng này đang phát triển"
            >
              <FaTrash /> Xóa{" "}
              {report.targetType === "user" ? "tài khoản" : "nội dung"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
