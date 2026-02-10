"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search, Globe, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 dark:bg-gray-900">
                    <div className="flex items-center gap-4 w-96">
                        {/* Search or Title could go here */}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="hidden md:flex">
                            Hướng dẫn
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
                            Góp ý
                        </Button>
                        <div className="flex items-center gap-3 border-l pl-4 ml-2">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium">{user?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
                            </div>
                            <Avatar>
                                <AvatarImage src={user?.image} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
