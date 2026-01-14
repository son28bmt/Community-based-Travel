"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FaUserCircle, FaSignOutAlt, FaCog, FaChartPie } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Khám phá", href: "/kham-pha" },
    { name: "Cộng đồng", href: "/cong-dong" },
    { name: "Về chúng tôi", href: "/about" },
  ];

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu Button - Left */}
        <button
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="space-y-1.5">
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </div>
        </button>

        {/* Logo - Center/Left */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg group-hover:scale-110 transition-transform">
            V
          </div>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight hidden sm:block">
            Du Lịch Việt
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                pathname === item.href
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 border border-gray-100 mr-2">
            <span className="text-xs font-bold text-gray-800 cursor-pointer hover:text-blue-600">
              VI
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-400 cursor-pointer hover:text-blue-600">
              EN
            </span>
          </div>

          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white border border-gray-200 rounded-full hover:shadow-md transition-all"
              >
                <span className="text-sm font-bold text-gray-700 hidden sm:block pl-2 max-w-[100px] truncate">
                  {session.user?.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                  {getInitials(session.user?.name || "")}
                </div>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {session.user?.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaChartPie className="text-blue-500" /> Trang quản
                          trị
                        </Link>
                      )}
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaUserCircle className="text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      <Link
                        href="/user/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaCog className="text-gray-400" /> Cài đặt tài khoản
                      </Link>
                    </div>

                    <div className="border-t border-gray-50 pt-1 mt-1">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block px-5 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {/* Optional: Add icons here if desired */}
                  {item.name}
                </Link>
              ))}
              {!session && (
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-gray-100 rounded-xl text-sm font-bold text-gray-700"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-blue-600 rounded-xl text-sm font-bold text-white"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
