"use client";

import { FaUsers, FaGlobeAsia, FaHandHoldingHeart } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="bg-white pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center bg-blue-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-900/80 z-10"></div>
          {/* Placeholder for Hero Image - In production use next/image */}
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=2077&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>
        <div className="container relative z-20 px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Kết Nối Đam Mê <br className="hidden md:block" />
            <span className="text-blue-300">Khám Phá Việt Nam</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100 mb-10 leading-relaxed font-medium">
            Chúng tôi xây dựng cộng đồng du lịch lớn nhất Việt Nam, nơi mỗi
            chuyến đi là một câu chuyện, mỗi địa điểm là một trải nghiệm đáng
            nhớ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1">
              Tham gia ngay
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full font-bold transition-all border border-white/30">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-16 z-30 container mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-gray-100">
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                50K+
              </div>
              <div className="text-gray-500 font-medium text-sm md:text-base">
                Thành viên tích cực
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                10K+
              </div>
              <div className="text-gray-500 font-medium text-sm md:text-base">
                Địa điểm chia sẻ
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                100+
              </div>
              <div className="text-gray-500 font-medium text-sm md:text-base">
                Tỉnh thành & Vùng
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                4.8
              </div>
              <div className="text-gray-500 font-medium text-sm md:text-base">
                Đánh giá trung bình
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
            Giá trị cốt lõi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Tại sao chọn Du Lịch Việt?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-blue-50 transition-colors duration-300 border border-gray-100 hover:border-blue-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FaGlobeAsia />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
              Sứ mệnh kết nối
            </h3>
            <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
              Kết nối du khách với những điểm đến độc đáo, mang lại trải nghiệm
              du lịch chân thực và đáng tin cậy nhất từ cộng đồng địa phương.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-red-50 transition-colors duration-300 border border-gray-100 hover:border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FaUsers />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors">
              Cộng đồng văn minh
            </h3>
            <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
              Xây dựng môi trường chia sẻ lành mạnh, nơi mọi đóng góp đều được
              trân trọng và mỗi thành viên đều là một hướng dẫn viên tận tâm.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-green-50 transition-colors duration-300 border border-gray-100 hover:border-green-100">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FaHandHoldingHeart />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
              Du lịch bền vững
            </h3>
            <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
              Khuyến khích du lịch có trách nhiệm, bảo vệ môi trường và tôn
              vinh, gìn giữ bản sắc văn hóa địa phương.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Placeholder Image */}
                <div className="aspect-[4/3] bg-gray-300 w-full bg-[url('https://pub-58c1a2fe07b6492fbadd2e958ca80bb9.r2.dev/locations/daihoitoanquoc.jpg')] bg-cover bg-center"></div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">
                Về chúng tôi
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Hành trình từ niềm đam mê <br />{" "}
                <span className="text-blue-600">xê dịch</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Xuất phát từ một nhóm bạn trẻ đam mê khám phá những cung đường
                  lạ, chúng tôi nhận ra rằng thông tin du lịch Việt Nam còn tản
                  mát và thiếu độ tin cậy. Đó là lúc ý tưởng về{" "}
                  <strong className="text-gray-900">Du Lịch Việt</strong> ra
                  đời.
                </p>
                <p>
                  Chúng tôi không chỉ xây dựng một website, mà là một ngôi nhà
                  chung cho những người yêu du lịch. Nơi bạn không chỉ tìm thấy
                  thông tin, mà còn tìm thấy những người bạn đồng hành.
                </p>
                <div className="pt-4 border-t border-gray-200 mt-8">
                  <p className="italic font-medium text-gray-800">
                    "Đi để trở về, đi để trưởng thành, và đi để yêu thêm đất
                    nước mình."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 opacity-90">
              Tham gia cùng hàng ngàn thành viên khác, chia sẻ hành trình của
              bạn và khám phá những điều kỳ diệu đang chờ đón.
            </p>
            <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Đăng ký thành viên ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

