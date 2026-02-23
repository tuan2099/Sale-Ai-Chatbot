"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

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
                        <Link href="/dashboard/guide" passHref>
                            <Button variant="ghost" size="sm" className="hidden md:flex">
                                Hướng dẫn
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
                            Góp ý
                        </Button>
                        <div className="flex items-center gap-3 border-l pl-4 ml-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.image} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Thông tin cá nhân</span>
                                    </DropdownMenuItem>
                                    {user?.role === 'ADMIN' && (
                                        <DropdownMenuItem onClick={() => router.push("/admin/users")} className="text-red-600 focus:text-red-600 foocus:bg-red-50">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Quản trị viên</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 bg-red-50 focus:bg-red-100 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
