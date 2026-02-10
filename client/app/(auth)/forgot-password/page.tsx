"use client";

import { toast } from "sonner";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema } from "@/schemas";
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
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gửi yêu cầu thất bại");
            }

            setIsSubmitted(true);
            toast.success("Email đặt lại mật khẩu đã được gửi!");
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
                <div className="relative z-20 text-white p-12">
                    <h1 className="text-6xl font-bold mb-6">SALE AI</h1>
                    <p className="text-xl text-blue-100">Giải pháp bán hàng thông minh tích hợp AI.</p>
                    <p className="mt-4 text-blue-200">Tự động hoá quy trình chốt đơn - Tối ưu doanh thu.</p>
                </div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 z-0"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 z-0"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                <Card className="w-full max-w-md shadow-lg border-none bg-white/80 backdrop-blur-sm dark:bg-black/50">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4 lg:hidden">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">SALE AI</span>
                        </div>
                        <div className="flex justify-center mb-4">
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">SALE AI</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu?</CardTitle>
                        <CardDescription className="text-center">
                            Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="text-center space-y-4">
                                <div className="bg-blue-100 text-blue-700 p-4 rounded-md">
                                    Một email đặt lại mật khẩu đã được gửi đến <strong>{form.getValues("email")}</strong>.
                                    Vui lòng kiểm tra hộp thư của bạn.
                                </div>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/login">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Quay lại đăng nhập
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="your@email.com" className="pl-9" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Gửi link đặt lại mật khẩu
                                    </Button>

                                    <div className="text-center">
                                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center">
                                            <ArrowLeft className="mr-1 h-3 w-3" />
                                            Quay lại đăng nhập
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
