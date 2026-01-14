"use client";

import { FaUsers, FaGlobeAsia, FaHandHoldingHeart } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="bg-white pb-20">
      {/* Hero */}
      <div className="bg-blue-600 text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Xin chào, chúng mình là Du Lịch Việt
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Kết nối những tâm hồn đam mê xê dịch, cùng nhau chia sẻ và khám phá
            vẻ đẹp bất tận của Việt Nam.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <FaGlobeAsia />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sứ mệnh</h3>
            <p className="text-gray-600">
              Mang đến thông tin du lịch trung thực, hữu ích và cập nhật nhất từ
              chính cộng đồng người dùng.
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <FaUsers />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cộng đồng</h3>
            <p className="text-gray-600">
              Xây dựng một sân chơi văn minh, nơi mọi người tôn trọng và hỗ trợ
              lẫn nhau trên mọi nẻo đường.
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <FaHandHoldingHeart />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Giá trị</h3>
            <p className="text-gray-600">
              Đề cao trải nghiệm thực tế, bảo vệ môi trường và tôn vinh văn hóa
              bản địa.
            </p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="h-96 bg-gray-300 rounded-2xl w-full"></div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Câu chuyện của chúng mình
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Xuất phát từ một nhóm sinh viên đam mê du lịch bụi, chúng mình
              nhận thấy việc tìm kiếm thông tin tin cậy về các địa điểm du lịch
              tại Việt Nam còn nhiều khó khăn.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Đó là lý do Du Lịch Việt ra đời - một nền tảng mở cho phép bất kỳ
              ai cũng có thể trở thành một "hướng dẫn viên" cho người khác.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors">
              Tham gia cộng đồng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
