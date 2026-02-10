"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ResetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const token = searchParams.get("token");

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
        if (!token) {
            toast.error("Thiếu token xác thực. Vui lòng kiểm tra lại email.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: values.newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

            toast.success("Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-red-600">Lỗi xác thực</CardTitle>
                    <CardDescription>
                        Không tìm thấy token đặt lại mật khẩu. Vui lòng truy cập từ liên kết trong email của bạn.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push("/login")} className="w-full">
                        Quay lại Đăng nhập
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-[400px] border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <KeyRound className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
                <CardDescription className="text-center">
                    Nhập mật khẩu mới cho tài khoản của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Cập nhật mật khẩu"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-blue-600" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
