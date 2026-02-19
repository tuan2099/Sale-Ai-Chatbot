"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full py-6 bg-gray-100 dark:bg-gray-800 border-t">
            <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        © 2024 Sale AI Chatbot. All rights reserved.
                    </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <Link className="hover:underline" href="/terms">
                        Điều khoản sử dụng
                    </Link>
                    <Link className="hover:underline" href="/privacy">
                        Chính sách bảo mật
                    </Link>
                    <Link className="hover:underline" href="#">
                        Liên hệ
                    </Link>
                </div>
            </div>
        </footer>
    );
}
