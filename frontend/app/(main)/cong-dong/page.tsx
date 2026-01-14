"use client";

import {
  FaComment,
  FaHeart,
  FaUserCircle,
  FaPlus,
  FaFire,
} from "react-icons/fa";

export default function CommunityPage() {
  const posts = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      avatar: "bg-blue-100",
      time: "2 giờ trước",
      content:
        "Mọi người cho mình hỏi đi Đà Nẵng mùa này có mưa không ạ? Mình định đi tuần sau.",
      likes: 15,
      comments: 8,
      tags: ["Hỏi đáp", "Đà Nẵng"],
    },
    {
      id: 2,
      user: "Trần Thị B",
      avatar: "bg-pink-100",
      time: "5 giờ trước",
      content:
        "Review chuyến đi Hà Giang 3 ngày 2 đêm siêu tiết kiệm cho các bạn sinh viên! 👇\nTổng chi phí chỉ 1tr5/người. Cảnh đẹp mê hồn luôn...",
      image: "bg-gray-200 h-64",
      likes: 156,
      comments: 42,
      tags: ["Review", "Hà Giang", "Kinh nghiệm"],
    },
    {
      id: 3,
      user: "Lê Văn C",
      avatar: "bg-green-100",
      time: "1 ngày trước",
      content:
        "Góc cảnh báo: Quán ăn X ở Vũng Tàu chặt chém khách du lịch. Mọi người né ra nhé!",
      likes: 89,
      comments: 120,
      tags: ["Cảnh báo", "Vũng Tàu"],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Filters */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Chuyên mục</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-between p-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer font-medium">
                  <span>Tất cả</span>
                  <span className="bg-white px-2 py-0.5 rounded text-xs">
                    10k+
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600">
                  <span>Review</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    5k
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600">
                  <span>Hỏi đáp</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    3k
                  </span>
                </li>
                <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-600">
                  <span>Tìm bạn đồng hành</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    1k
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Feed */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* New Post Input */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <FaUserCircle size={24} />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Bạn muốn chia sẻ điều gì?"
                  className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm mb-3"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                      📷 Ảnh/Video
                    </button>
                    <button className="text-xs font-medium text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                      😊 Cảm xúc
                    </button>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-600 flex items-center gap-1">
                    Đăng bài
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs (Mobile) */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold whitespace-nowrap">
                Tất cả
              </button>
              <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap">
                Review
              </button>
              <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap">
                Hỏi đáp
              </button>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full ${post.avatar} flex items-center justify-center font-bold text-gray-700`}
                  >
                    {post.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{post.user}</h4>
                    <span className="text-xs text-gray-500">{post.time}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {post.image && (
                  <div className={`w-full ${post.image} rounded-lg mb-4`}></div>
                )}

                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-gray-500">
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <FaHeart /> <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <FaComment /> <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar: Trending */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" /> Chủ đề nóng
              </h3>
              <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex gap-3 cursor-pointer group">
                    <span className="font-bold text-gray-300 text-xl">
                      0{i}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2">
                        Kinh nghiệm du lịch Phú Quốc 4 ngày 3 đêm
                      </h4>
                      <span className="text-xs text-gray-500">
                        2.5k thảo luận
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-500 p-6 rounded-xl text-white text-center">
              <h3 className="font-bold text-lg mb-2">
                Trở thành Local Expert?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Chia sẻ kiến thức của bạn và nhận huy hiệu độc quyền.
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50">
                Tham gia ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
