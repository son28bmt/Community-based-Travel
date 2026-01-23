"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AccountSettings() {
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({
    current: session?.user?.email || "",
    new: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [activityStatus, setActivityStatus] = useState(true);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Yêu cầu đổi email đã được gửi!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    toast.success("Đổi mật khẩu thành công!");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      {/* Email Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cập nhật Email</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Email này dùng để nhận thông báo và khôi phục tài khoản.
            </p>
          </div>
          {session?.user?.email && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
              <FaCheckCircle />{" "}
              <span className="hidden sm:inline">Đã xác minh</span>
            </span>
          )}
        </div>

        <form
          onSubmit={handleUpdateEmail}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email hiện tại
            </label>
            <input
              readOnly
              value={emailForm.current}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email mới
            </label>
            <input
              type="email"
              placeholder="Nhập email mới của bạn"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
              value={emailForm.new}
              onChange={(e) =>
                setEmailForm({ ...emailForm, new: e.target.value })
              }
            />
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Đổi mật khẩu</h3>
        <p className="text-sm text-gray-500 mb-6">
          Chúng tôi khuyên bạn nên sử dụng mật khẩu mạnh mà bạn không dùng ở nơi
          khác.
        </p>

        <form className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
              value={passwordForm.new}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, new: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
              value={passwordForm.confirm}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm: e.target.value })
              }
            />
          </div>
        </form>
      </div>

      {/* Linked Accounts */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Tài khoản liên kết
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Đăng nhập nhanh chóng và bảo mật hơn với các tài khoản mạng xã hội.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 text-xl border shrink-0">
                <FaGoogle />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Google</h4>
                <p className="text-xs text-green-600 font-medium break-all">
                  Đã kết nối: {session?.user?.email}
                </p>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:shadow-sm transition">
              Ngắt kết nối
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 shadow-sm flex items-center justify-center text-white text-xl border-blue-600 shrink-0">
                <FaFacebook />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Facebook</h4>
                <p className="text-xs text-gray-500">Chưa kết nối</p>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200">
              Kết nối ngay
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Activity */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Quyền riêng tư & Hoạt động
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Kiểm soát ai có thể xem nội dung và hoạt động của bạn trên cộng đồng.
        </p>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Ai có thể xem bài viết của tôi?
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Thiết lập mặc định cho các bài chia sẻ chuyến đi mới.
              </p>
            </div>
            <select className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-blue-500 bg-white text-gray-900">
              <option>Bạn bè</option>
              <option>Công khai</option>
              <option>Chỉ mình tôi</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Hiển thị trạng thái hoạt động
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Cho người khác biết khi bạn đang trực tuyến để lên kế hoạch cùng
                nhau.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activityStatus}
                onChange={() => setActivityStatus(!activityStatus)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 pb-20 md:pb-0">
        <button className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition">
          Hủy bỏ
        </button>
        <button
          onClick={handleUpdatePassword}
          className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition hover:-translate-y-0.5"
        >
          Lưu Thay Đổi
        </button>
      </div>
    </div>
  );
}
