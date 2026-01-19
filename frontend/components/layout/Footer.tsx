import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 mb-12">
          {/* Brand */}
          <div className="space-y-4 col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <span className="text-xl font-bold text-gray-800">
                Du Lịch Việt
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Cộng đồng chia sẻ trải nghiệm du lịch Việt Nam lớn nhất. Cùng nhau
              khám phá vẻ đẹp tiềm ẩn của đất nước.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Khám phá</h3>
            <ul className="flex flex-col gap-1 text-sm text-gray-500">
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Điểm đến nổi tiếng
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Địa điểm ăn uống
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Góc chụp ảnh đẹp
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Hoạt động ngoài trời
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Cộng đồng</h3>
            <ul className="flex flex-col gap-1 text-sm text-gray-500">
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Trở thành thành viên
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Chia sẻ địa điểm
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Quy tắc cộng đồng
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-1 hover:text-blue-600 transition-colors"
                >
                  Sự kiện du lịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Liên hệ</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li className="flex items-center gap-2 py-1">
                <span className="text-base">📧</span> hello@dulichviet.vn
              </li>
              <li className="flex items-center gap-2 py-1">
                <span className="text-base">📞</span> +84 123 456 789
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Youtube"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Du Lịch Việt Cộng Đồng. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-600">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
