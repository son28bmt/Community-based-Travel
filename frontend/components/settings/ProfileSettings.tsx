"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import {
  FaCamera,
  FaGlobe,
  FaMapMarkerAlt,
  FaPen,
  FaSmile,
  FaImage,
} from "react-icons/fa";

export default function ProfileSettings() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      avatar: "",
      coverImage: "",
      website: "",
      city: "",
    },
  });

  const avatarUrl = watch("avatar");
  const coverUrl = watch("coverImage");

  // Fetch user data
  useQuery({
    queryKey: ["user-profile-settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${session.user.id}`,
      );
      const user = res.data.user || res.data;
      reset({
        name: user.name,
        username: user.username || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || "",
        website: user.website || "",
        city: user.city || "",
      });
      return user;
    },
    enabled: !!session?.user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = (session as any)?.user?.accessToken;
      if (!token) throw new Error("Unauthorized");

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/me`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    },
    onSuccess: async (data) => {
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          username: data.user.username,
          image: data.user.avatar,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Lưu thay đổi thành công!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = (session as any)?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/uploads`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.url) {
        if (type === "avatar") setValue("avatar", res.data.url);
        else setValue("coverImage", res.data.url);
        toast.success("Đã tải ảnh lên");
      }
    } catch (error) {
      toast.error("Lỗi tải ảnh");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ</h1>
        <p className="text-gray-500">Quản lý thông tin công khai của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
        {/* Images Section - Separated */}
        <section className="space-y-8">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Ảnh đại diện
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Hình ảnh hiển thị đại diện cho bạn trên nền tảng.
            </p>

            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-50 shadow-sm bg-gray-100 overflow-hidden">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
                      {(session?.user?.name || "U")[0]}
                    </div>
                  )}
                </div>
                {/* Quick edit button on image */}
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:text-blue-600 transition"
                >
                  <FaPen size={12} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    {uploadingAvatar ? "Đang tải..." : "Tải ảnh mới"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("avatar", "")}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition"
                  >
                    Gỡ bỏ
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Định dạng JPG, PNG. Tối đa 2MB.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleImageUpload(e.target.files[0], "avatar")
                }
              />
            </div>
          </div>

          <hr className="border-gray-50 border-dashed" />

          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Ảnh bìa</h3>
            <p className="text-sm text-gray-500 mb-4">
              Hình ảnh lớn hiển thị ở đầu trang cá nhân của bạn.
            </p>

            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group hover:border-gray-400 transition-colors">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FaImage size={32} className="opacity-50" />
                  <span className="text-sm font-medium">Chưa có ảnh bìa</span>
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="bg-white text-gray-800 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <FaCamera />{" "}
                  {uploadingCover ? "Đang tải..." : "Thay đổi ảnh bìa"}
                </button>
              </div>

              {/* Always visible button for mobile/accessibility */}
              <div className="absolute top-4 right-4 md:hidden">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-700"
                >
                  <FaCamera />
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleImageUpload(e.target.files[0], "cover")
              }
            />
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Basic Info */}
        <section className="space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full inline-block"></span>
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Họ và tên
              </label>
              <input
                {...register("name", { required: "Họ tên là bắt buộc" })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Tên hiển thị (ID)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  @
                </span>
                <input
                  {...register("username", {
                    pattern: {
                      value: /^[a-z0-9._]+$/,
                      message: "Chỉ dùng chữ thường, số, dấu chấm và gạch dưới",
                    },
                    minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
                  })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="ten_dang_nhap"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Tiểu sử (Bio)
            </label>
            <div className="relative">
              {/* Fake Toolbar */}
              <div className="absolute top-2 left-2 flex gap-1 p-1">
                <span className="p-1 text-gray-400 font-serif font-bold text-xs">
                  B
                </span>
                <span className="p-1 text-gray-400 italic text-xs">I</span>
              </div>
              <textarea
                {...register("bio")}
                rows={4}
                className="w-full px-4 pt-8 pb-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="Mô tả ngắn về bạn..."
              />
              <FaSmile className="absolute bottom-3 right-3 text-gray-400" />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Links & Location */}
        <section className="space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-sm">
              <FaMapMarkerAlt />
            </span>
            Liên kết & Vị trí
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Trang web
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("website")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Tỉnh/Thành phố
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("city")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="TP. Hồ Chí Minh"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-bold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transition hover:-translate-y-0.5"
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
