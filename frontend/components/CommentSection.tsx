"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { FaUserCircle, FaHeart, FaReply, FaRegHeart } from "react-icons/fa";

interface CommentSectionProps {
  postId: string;
}

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/${postId}/comments?limit=100`,
      );
      return res.data;
    },
  });

  const comments = commentsData?.items || commentsData || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/${postId}/comments`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast.success("Đã gửi bình luận!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi gửi bình luận");
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (commentId: string) => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/comments/${commentId}/reply`,
        { content: replyContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      setReplyContent("");
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Đã trả lời!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi trả lời");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      // @ts-ignore
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No token");

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + ""}/api/posts/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => {
      toast.error("Vui lòng đăng nhập để thích bình luận");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!session) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    createMutation.mutate();
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!session) {
      toast.error("Vui lòng đăng nhập để trả lời");
      return;
    }
    replyMutation.mutate(commentId);
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-8">
        Bình luận cộng đồng ({comments?.length || 0})
      </h3>

      {/* Input */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex gap-4 items-start border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-green-500 text-white shrink-0 overflow-hidden flex items-center justify-center font-bold">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User"
              width={40}
              height={40}
              className="object-cover"
            />
          ) : session?.user?.name ? (
            session.user.name[0].toUpperCase()
          ) : (
            <FaUserCircle size={24} />
          )}
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ cảm nghĩ của bạn..."
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition resize-none h-24 text-sm text-gray-900 placeholder:text-gray-400"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!content.trim() || createMutation.isPending}
                className="bg-teal-600 text-white px-8 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">
            Đang tải bình luận...
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-600">Chưa có bình luận nào</p>
            <p className="text-sm text-gray-400">
              Hãy là người đầu tiên chia sẻ ý kiến về bài viết này.
            </p>
          </div>
        ) : (
          comments?.map((comment: any) => {
            // @ts-ignore
            const isLiked = comment.likes?.includes(session?.user?.id);
            const likeCount = comment.likes?.length || 0;

            return (
              <div key={comment._id} className="group">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                    {comment.user?.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-200">
                        {comment.user?.name?.[0] || <FaUserCircle size={24} />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {comment.user?.name || "Người dùng"}
                      </h4>
                      {comment.user?.role === "admin" && (
                        <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        • {formatDateTime(comment.createdAt)}
                      </span>
                    </div>

                    <div className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl rounded-tl-none inline-block max-w-full mb-2">
                      {comment.content}
                    </div>

                    <div className="flex items-center gap-4 ml-1">
                      <button
                        onClick={() => likeMutation.mutate(comment._id)}
                        className={`text-xs font-bold transition flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        {likeCount > 0 ? `${likeCount} Thích` : "Thích"}
                      </button>
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment._id ? null : comment._id,
                          )
                        }
                        className="text-xs font-bold text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
                      >
                        <FaReply /> Trả lời
                      </button>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                      <form
                        onSubmit={(e) => handleReplySubmit(e, comment._id)}
                        className="mt-4 flex gap-3 animate-fadeIn"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Trả lời ${comment.user?.name}...`}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-900 placeholder:text-gray-400"
                            autoFocus
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={
                            !replyContent.trim() || replyMutation.isPending
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          Gửi
                        </button>
                      </form>
                    )}

                    {/* Replies List */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                        {comment.replies.map((reply: any) => (
                          <div key={reply._id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                              {reply.user?.avatar ? (
                                <Image
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-200 text-xs">
                                  {reply.user?.name?.[0] || (
                                    <FaUserCircle size={16} />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 px-3 py-2 rounded-xl rounded-tl-none inline-block">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-gray-900 text-xs">
                                    {reply.user?.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {formatDateTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
