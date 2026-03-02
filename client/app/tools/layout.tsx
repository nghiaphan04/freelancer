"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const sidebarItems = [
  { icon: "calculate", label: "Lương Gross - Net", href: "/tools/gross-net" },
  { icon: "receipt_long", label: "Thuế thu nhập (PIT)", href: "/tools/pit" },
  { icon: "percent", label: "Lãi suất kép", href: "/tools/compound-interest" },
  { icon: "savings", label: "Kế hoạch tiết kiệm", href: "/tools/savings" },
  { icon: "elderly", label: "Bảo hiểm xã hội", href: "/tools/social-insurance" },
  { icon: "account_balance", label: "Bảo hiểm thất nghiệp", href: "/tools/unemployment-insurance" },
  { icon: "smartphone", label: "Mobile App", href: "/tools/mobile-app" },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full sm:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="sticky top-0 p-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-2 py-3 mb-6 text-gray-500 hover:text-[#00b14f] transition-colors group"
          >
            <Icon name="arrow_back" size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold uppercase tracking-wider">Quay lại Trang chủ</span>
          </Link>

          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Công cụ Freelancer
          </h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-[#00b14f]/10 text-[#00b14f]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
