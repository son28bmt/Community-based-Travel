"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import { FaCamera, FaSave, FaSpinner } from "react-icons/fa";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      avatar: "",
      coverImage: "",
    },
  });

  const avatarUrl = watch("avatar");
  const coverUrl = watch("coverImage");

  // Fetch current user data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.id) {
      axios
        .get(`http://localhost:5000/api/users/${session.user.id}`)
        .then((res) => {
          const user = res.data;
          reset({
            name: user.name,
            username: user.username || "",
            bio: user.bio,
            avatar: user.avatar,
            coverImage: user.coverImage,
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error("Không thể tải thông tin người dùng");
        });
    }
  }, [session, status, router, reset]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use specific loading state
    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = (session as any)?.user?.accessToken;
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.url) {
        if (type === "avatar") setValue("avatar", res.data.url);
        else setValue("coverImage", res.data.url);
        toast.success("Tải ảnh thành công!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = (session as any)?.user?.accessToken;
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      await axios.put("http://localhost:5000/api/users/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update Client Session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          username: data.username || session?.user?.username,
          image: data.avatar || session?.user?.image,
        },
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      toast.success("Cập nhật hồ sơ thành công!");
      router.refresh();
      router.push(`/thanh-vien/${data.username || session?.user?.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa hồ sơ
            </h1>
            <p className="text-gray-500">Cập nhật thông tin cá nhân của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Cover Image */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">
                Ảnh bìa
              </label>
              <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition group cursor-pointer">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaCamera className="text-3xl mb-2" />
                    <span>Nhấn để tải ảnh bìa</span>
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    <FaSpinner className="animate-spin text-2xl" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, "cover")}
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">
                Ảnh đại diện
              </label>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-500 transition overflow-hidden group cursor-pointer shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <FaCamera />
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <FaSpinner className="animate-spin" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, "avatar")}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Nên sử dụng ảnh vuông, kích thước tối thiểu 150x150px.</p>
                  <p>Định dạng hỗ trợ: JPG, PNG.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Email
                </label>
                <input
                  value={session?.user?.email || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Tên định danh (ID)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    @
                  </span>
                  <input
                    {...register("username", {
                      pattern: {
                        value: /^[a-z0-9._]+$/,
                        message:
                          "Chỉ chấp nhận chữ thường, số, dấu chấm và gạch dưới",
                      },
                      minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
                    })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder="travel_lover_123"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Sẽ hiển thị trên link hồ sơ của bạn.
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Giới thiệu bản thân
              </label>
              <textarea
                {...register("bio")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                placeholder="Chia sẻ đôi điều về sở thích du lịch của bạn..."
              />
              <p className="text-xs text-gray-400 text-right">
                Tối đa 500 ký tự
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || uploadingAvatar || uploadingCover}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
