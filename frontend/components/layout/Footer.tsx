import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <span className="text-xl font-bold text-gray-800">
                Du Lịch Việt
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Cộng đồng chia sẻ trải nghiệm du lịch Việt Nam lớn nhất. Cùng nhau
              khám phá vẻ đẹp tiềm ẩn của đất nước.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Khám phá</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Điểm đến nổi tiếng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Địa điểm ăn uống
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Góc chụp ảnh đẹp
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Hoạt động ngoài trời
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Cộng đồng</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Trở thành thành viên
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Chia sẻ địa điểm
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Quy tắc cộng đồng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Sự kiện du lịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span>📧</span> hello@dulichviet.vn
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +84 123 456 789
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2024 Du Lịch Việt Cộng Đồng. All rights reserved.</p>
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
