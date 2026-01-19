"use client";

import { useEffect } from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Đã có lỗi xảy ra!
        </h2>
        <p className="text-gray-600 mb-6">
          Chúng tôi rất tiếc vì sự cố này. Vui lòng thử tải lại trang hoặc quay
          lại sau.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-blue-200 shadow-md"
          >
            <FaRedo /> Thử lại
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition-colors"
          >
            Về trang chủ
          </button>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400 font-mono">
            CODE: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
