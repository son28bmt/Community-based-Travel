import Link from "next/link";
import { FaCompass, FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-200 blur-3xl opacity-30 rounded-full"></div>
        <FaCompass className="text-[120px] text-blue-600 relative z-10 animate-pulse" />
      </div>

      <h1 className="text-6xl font-extrabold text-blue-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Không tìm thấy trang
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        Có vẻ như bạn đang đi lạc. Trang bạn đang tìm kiếm không tồn tại hoặc đã
        bị di chuyển.
      </p>

      <Link
        href="/"
        className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all hover:scale-105"
      >
        <FaHome /> Về trang chủ
      </Link>
    </div>
  );
}
