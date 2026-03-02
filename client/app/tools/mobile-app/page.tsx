"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/Icon";
import Image from "next/image";

export default function MobileAppPage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00b14f]/10 text-[#00b14f] text-sm font-semibold mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b14f] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00b14f]"></span>
          </span>
          Sắp ra mắt trên iOS & Android
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Làm việc tự do, <br /> 
          <span className="text-[#00b14f]">Quản lý mọi nơi.</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Đưa sự nghiệp freelancer của bạn lên tầm cao mới với ứng dụng di động chính thức. Nhận thông báo việc làm mới, chat với khách hàng và quản lý tiến độ dự án ngay trên lòng bàn tay.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 h-14 rounded-2xl flex gap-3 items-center">
            <Icon name="apple" size={24} />
            <div className="text-left">
              <p className="text-[10px] uppercase opacity-60 leading-none">Download on the</p>
              <p className="text-lg font-semibold leading-none mt-1">App Store</p>
            </div>
          </Button>
          <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 h-14 rounded-2xl flex gap-3 items-center">
            <Icon name="play_arrow" size={24} />
            <div className="text-left">
              <p className="text-[10px] uppercase opacity-60 leading-none">Get it on</p>
              <p className="text-lg font-semibold leading-none mt-1">Google Play</p>
            </div>
          </Button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-[#00b14f]/10 hover:border-[#00b14f]/30 transition-colors bg-white/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-[#00b14f]/10 rounded-xl flex items-center justify-center text-[#00b14f] mb-6">
            <Icon name="bolt" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Thông báo tức thời</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Đừng bao giờ bỏ lỡ cơ hội. Nhận thông báo ngay khi có việc làm mới phù hợp với kỹ năng của bạn hoặc tin nhắn từ đối tác.
          </p>
        </Card>
        <Card className="p-8 border-[#00b14f]/10 hover:border-[#00b14f]/30 transition-colors bg-white/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
            <Icon name="chat" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Giao tiếp mượt mà</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hệ thống chat tích hợp cho phép bạn gửi báo giá, thảo luận chi tiết công việc và gửi tệp tin cho khách hàng mọi lúc, mọi nơi.
          </p>
        </Card>
        <Card className="p-8 border-[#00b14f]/10 hover:border-[#00b14f]/30 transition-colors bg-white/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
            <Icon name="wallet" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Quản lý tài chính</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Theo dõi số dư ví, yêu cầu rút tiền và kiểm tra lịch sử thanh toán một cách an toàn và minh bạch ngay trên điện thoại.
          </p>
        </Card>
      </section>

      {/* Mockup Section */}
      <section className="bg-gray-100 rounded-3xl p-8 sm:p-12 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Trải nghiệm người dùng <br /> được tối ưu cho di động
            </h2>
            <ul className="space-y-4">
              {[
                "Giao diện tối giản, dễ sử dụng",
                "Chế độ Dark Mode bảo vệ mắt",
                "Tiết kiệm dữ liệu di động",
                "Bảo mật vân tay / FaceID"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-6 h-6 bg-[#00b14f] rounded-full flex items-center justify-center text-white">
                    <Icon name="check" size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Button className="bg-[#00b14f] hover:bg-[#009643] rounded-full px-8">Đăng ký nhận thông báo</Button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
             {/* Simple CSS-based Smartphone Frame Mockup */}
             <div className="w-[280px] h-[580px] bg-gray-900 rounded-[40px] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="h-6 w-32 bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
                <div className="flex-1 bg-white p-4 space-y-4">
                   <div className="h-8 w-8 bg-[#00b14f] rounded-lg mt-8" />
                   <div className="h-4 w-3/4 bg-gray-200 rounded" />
                   <div className="h-4 w-1/2 bg-gray-100 rounded" />
                   <div className="grid grid-cols-2 gap-2 mt-8">
                      <div className="aspect-square bg-gray-100 rounded-xl" />
                      <div className="aspect-square bg-gray-100 rounded-xl" />
                      <div className="aspect-square bg-gray-100 rounded-xl" />
                      <div className="aspect-square bg-gray-100 rounded-xl" />
                   </div>
                </div>
                <div className="h-1 w-24 bg-gray-200 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full" />
             </div>
             {/* Decorative circles */}
             <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#00b14f]/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>
    </div>
  );
}
