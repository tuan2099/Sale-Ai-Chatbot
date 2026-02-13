"use client";

import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    ShoppingBag,
    Users,
    MessageSquare,
    Globe,
    Store,
    ArrowLeft,
    Settings,
    BarChart3,
    Bot,
    Palette,
    Database,
    FileUp,
    Megaphone,
    Share2
} from "lucide-react";
import { Suspense } from "react";

function SidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab");



    // 1. If on root Dashboard, Hide Sidebar
    if (pathname === "/dashboard") {
        return null;
    }

    // 2. Parsed Store ID from URL (if any)
    // Path format: /dashboard/stores/[id] or /dashboard/stores/[id]/...
    const storeMatch = pathname.match(/^\/dashboard\/stores\/([^/]+)/);
    const storeId = storeMatch ? storeMatch[1] : null;

    // 3. Define Logic for Sidebar Items
    type SidebarItem = {
        href: string;
        icon: any;
        label: string;
        isNew?: boolean;
    };

    let sidebarItems: SidebarItem[] = [];

    if (storeId) {
        // --- STORE CONTEXT ---
        sidebarItems = [
            { href: `/dashboard/stores/${storeId}?tab=analytics`, icon: BarChart3, label: "Thống kê" },
            { href: `/dashboard/stores/${storeId}?tab=chat`, icon: MessageSquare, label: "Hội thoại" },
            { href: `/dashboard/customers?storeId=${storeId}`, icon: Users, label: "Khách hàng" },
            { href: `/dashboard/stores/${storeId}?tab=ai`, icon: Bot, label: "Cấu hình AI" },
            { href: `/dashboard/stores/${storeId}?tab=widget`, icon: Palette, label: "Giao diện Chat" },
            { href: `/dashboard/stores/${storeId}?tab=knowledge`, icon: Database, label: "Nguồn dữ liệu" },
            { href: `/dashboard/stores/${storeId}?tab=leads`, icon: Settings, label: "Thu thập Leads" },
            { href: `/dashboard/stores/${storeId}?tab=team`, icon: Users, label: "Đội ngũ" },
            { href: `/dashboard/stores/${storeId}?tab=scripts`, icon: FileUp, label: "Kịch bản & Từ khóa" },
            { href: `/dashboard/stores/${storeId}?tab=broadcasts`, icon: Megaphone, label: "Chiến dịch gửi tin" },
            { href: `/dashboard/stores/${storeId}?tab=integration`, icon: Share2, label: "Kết nối đa kênh" },
        ];
    } else {
        // --- GLOBAL CONTEXT (Fall back or explicit pages like User Profile) ---
        // If user is on /dashboard/profile or /dashboard/customers (global)
        // We might want to show a limited sidebar or redirect logic.
        // For now, let's keep a "Personal" sidebar if not in a store.
        sidebarItems = [
            { href: "/dashboard", icon: ArrowLeft, label: "Chọn cửa hàng" },
            { href: "/dashboard/profile", icon: User, label: "Thông tin cá nhân" },
        ];
    }

    return (
        <div className="flex flex-col h-full bg-white border-r w-64 dark:bg-gray-900 overflow-y-auto hidden md:flex shrink-0">
            <div className="p-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <span>AI AGENT PLATFORM</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {storeId && (
                    <div className="mb-4 px-4 py-2 bg-blue-50 rounded-lg text-blue-800 text-sm font-medium flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span className="truncate">Cửa hàng đang chọn</span>
                    </div>
                )}

                {sidebarItems.map((item) => {
                    const Icon = item.icon;

                    // Active logic: 
                    // 1. If item has ?tab=, match pathname AND tab param
                    // 2. If item matches pathname and has NO tab param in href, match if currentTab is null (or default)

                    let isActive = false;

                    if (item.href.includes("?tab=")) {
                        const itemTab = item.href.split("?tab=")[1];
                        isActive = pathname === item.href.split("?")[0] && currentTab === itemTab;
                    } else if (item.href.includes("?storeId=")) {
                        // For customers/orders pages that use storeId query param but are different pages
                        isActive = pathname === item.href.split("?")[0];
                    } else {
                        // Exact match for non-tab links
                        isActive = pathname === item.href;
                    }

                    return (
                        <Link
                            key={item.label + item.href}
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

                {storeId && (
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors mt-4 border-t pt-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Đổi cửa hàng</span>
                    </Link>
                )}
            </nav>


        </div>
    );
}

export function Sidebar() {
    return (
        <Suspense fallback={<div className="w-64 bg-white border-r h-full" />}>
            <SidebarContent />
        </Suspense>
    );
}
