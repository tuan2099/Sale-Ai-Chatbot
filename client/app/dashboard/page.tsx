"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for token in URL (from OAuth redirect)
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            // Decode token or fetch user profile would be better here, 
            // but for now we rely on what we have or fetch profile
            router.replace("/dashboard"); // Clean URL
        }

        // Check for existing token/user
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!storedToken) {
            router.push("/login");
        } else {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [searchParams, router]);

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Chào mừng, {user?.name || "Người dùng"}!</h2>
                <p className="text-gray-600">Email: {user?.email}</p>
                <p className="mt-4">Bạn đã đăng nhập thành công vào hệ thống Sale AI.</p>
            </div>
        </div>
    );
}
