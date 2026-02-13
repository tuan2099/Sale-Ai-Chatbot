"use client";

import { MessageSquare, Bot, Users, BarChart3, Globe, Zap } from "lucide-react";

const features = [
    {
        icon: Globe,
        title: "Đa kênh tích hợp",
        description: "Quản lý tin nhắn từ Fanpage Facebook, Zalo OA và Website trên một giao diện duy nhất.",
    },
    {
        icon: Bot,
        title: "AI Chatbot Thông minh",
        description: "Học từ dữ liệu của bạn để trả lời khách hàng tự nhiên, chính xác 24/7.",
    },
    {
        icon: Users,
        title: "CRM Tự động",
        description: "Tự động thu thập thông tin khách hàng, phân loại và lưu trữ lịch sử tương tác.",
    },
    {
        icon: ArrowRight, // Using ArrowRight as placeholder if specific icon needed, but Zap is better
        title: "Kịch bản bán hàng",
        description: "Thiết lập các kịch bản trả lời tự động, gửi tin nhắn hàng loạt (Broadcast).",
    },
    {
        icon: Zap,
        title: "Phản hồi tức thì",
        description: "Không để khách hàng chờ đợi. Tăng tỷ lệ chuyển đổi với tốc độ phản hồi < 1s.",
    },
    {
        icon: BarChart3,
        title: "Báo cáo chi tiết",
        description: "Theo dõi hiệu quả hội thoại, năng suất nhân viên và tăng trưởng khách hàng.",
    },
];

import { ArrowRight } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900 border-t">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            Tính năng nổi bật
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            Mọi thứ bạn cần để tăng trưởng doanh số
                        </h2>
                        <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            Nền tảng của chúng tôi cung cấp bộ công cụ toàn diện giúp doanh nghiệp của bạn vận hành hiệu quả hơn.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-800">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
