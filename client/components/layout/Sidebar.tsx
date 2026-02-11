"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    LogOut,
    ShoppingBag,
    Users,
    MessageSquare,
    BarChart3,
    Bot,
    Globe,
    Settings,
    Store
} from "lucide-react";

const sidebarItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Trang chủ" },
    { href: "/dashboard/stores", icon: Store, label: "Cửa hàng" },
    { href: "/dashboard/ai-agent", icon: Bot, label: "AI Agent" },
    { href: "/dashboard/chat", icon: MessageSquare, label: "Tham gia Chat" },
    { href: "/dashboard/ai-website", icon: Globe, label: "AI Website", isNew: true },
    { href: "/dashboard/orders", icon: ShoppingBag, label: "Đơn hàng", isNew: true },
    { href: "/dashboard/customers", icon: Users, label: "Khách hàng" },
    { href: "/dashboard/profile", icon: User, label: "Thông tin cá nhân" },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <div className="flex flex-col h-full bg-white border-r w-64 dark:bg-gray-900 overflow-y-auto">
            <div className="p-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <span>AI AGENT PLATFORM</span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            {item.isNew && (
                                <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                    Mới
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
