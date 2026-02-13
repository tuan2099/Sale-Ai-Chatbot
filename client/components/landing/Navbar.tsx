"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-black/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                    <Bot className="h-6 w-6 text-blue-600" />
                    <span>Sale AI Chatbot</span>
                </Link>
                <div className="hidden md:flex gap-6 text-sm font-medium">
                    <Link className="hover:text-blue-600 transition-colors" href="#features">
                        Tính năng
                    </Link>
                    <Link className="hover:text-blue-600 transition-colors" href="#pricing">
                        Bảng giá
                    </Link>
                    <Link className="hover:text-blue-600 transition-colors" href="/dashboard/guide">
                        Hướng dẫn
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Đăng nhập
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Dùng thử miễn phí
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
