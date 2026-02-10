"use client";

import { toast } from "sonner";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Github, Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng nhập thất bại");
            }

            // TODO: Use a proper auth context or library (NextAuth/Clerk) in future.
            // For now, simple localStorage/cookie for Phase 1.
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");
            toast.success("Đăng nhập thành công!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Image/Feature */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-purple-900 opacity-90 z-10" />
                {/* Placeholder for the image described by user */}
                <div className="relative z-20 text-white p-12">
                    <h1 className="text-6xl font-bold mb-6">SALE AI</h1>
                    <p className="text-xl text-blue-100">Giải pháp bán hàng thông minh tích hợp AI.</p>
                    <p className="mt-4 text-blue-200">Tự động hoá quy trình chốt đơn - Tối ưu doanh thu.</p>
                </div>
                {/* Circle decoration */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 z-0"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 z-0"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                <Card className="w-full max-w-md shadow-lg border-none bg-white/80 backdrop-blur-sm dark:bg-black/50">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4 lg:hidden">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">SALE AI</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Chào mừng trở lại!</CardTitle>
                        <CardDescription className="text-center">
                            Đăng nhập vào tài khoản của bạn để tiếp tục
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Mật khẩu</FormLabel>
                                                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                                    Quên mật khẩu?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Đăng nhập
                                </Button>
                            </form>
                        </Form>

                        <div className="my-4 flex items-center gap-4">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground uppercase">Hoặc</span>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
                                <Globe className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => alert("Zalo OAuth chưa được hỗ trợ, vui lòng dùng Google hoặc Facebook")}>
                                <Github className="mr-2 h-4 w-4" />
                                Zalo
                            </Button>
                        </div>

                        <div className="mt-4 text-center text-sm">
                            Chưa có tài khoản?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
