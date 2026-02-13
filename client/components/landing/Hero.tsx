"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <Sparkles className="mr-1 h-3 w-3" />
                        <span>AI thế hệ mới cho bán hàng</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none max-w-3xl">
                        Tự động hóa chăm sóc khách hàng đa kênh với AI
                    </h1>
                    <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                        Kết nối Facebook, Zalo và Website. Để AI tư vấn, chốt đơn và quản lý khách hàng 24/7. Tăng doanh thu, giảm chi phí nhân sự.
                    </p>
                    <div className="space-x-4 pt-4">
                        <Link href="/register">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg">
                                Bắt đầu miễn phí <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                                Tìm hiểu thêm
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Abstract Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl opacity-50 dark:bg-blue-900/20" />
        </section>
    );
}
