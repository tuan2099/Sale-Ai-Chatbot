"use client";

import { toast } from "sonner";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Camera, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// Schemas (Ideally move to schemas/index.ts)
const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Họ và tên là bắt buộc"),
    phoneNumber: z.string().optional(),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Forms
    const profileForm = useForm<z.infer<typeof UpdateProfileSchema>>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: { name: "", phoneNumber: "" },
    });

    const passwordForm = useForm<z.infer<typeof ChangePasswordSchema>>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    profileForm.reset({
                        name: data.name || "",
                        phoneNumber: data.phoneNumber || ""
                    });
                    // Update local storage user for sidebar/header
                    localStorage.setItem("user", JSON.stringify(data));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileForm]);

    // Handlers
    const onUpdateProfile = async (values: z.infer<typeof UpdateProfileSchema>) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error("Cập nhật thất bại");

            const data = await res.json();
            setUser((prev: any) => ({ ...prev, ...data.user }));
            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    const onChangePassword = async (values: z.infer<typeof ChangePasswordSchema>) => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/user/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

            toast.success("Đổi mật khẩu thành công!");
            passwordForm.reset();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const onAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp hình ảnh");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh tối đa là 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);

        setUploading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/user/avatar", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload ảnh thất bại");

            setUser((prev: any) => ({ ...prev, image: data.user.image }));

            // Sync with localStorage
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            localUser.image = data.user.image;
            localStorage.setItem("user", JSON.stringify(localUser));

            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
                <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Overview */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tổng quan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user?.image} />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white"
                                    title="Thay đổi ảnh"
                                    onClick={onAvatarClick}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4 text-gray-600" />
                                    )}
                                </Button>
                            </div>
                            <h3 className="font-bold text-xl">{user?.name}</h3>
                            <p className="text-sm text-gray-500">{user?.email}</p>

                            <div className="mt-6 w-full flex justify-between text-sm">
                                <span className="text-gray-500">Trạng thái</span>
                                <span className="text-green-600 font-medium">Hoạt động</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chi tiết</CardTitle>
                            <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                                    <div className="space-y-2">
                                        <FormLabel>Email</FormLabel>
                                        <Input value={user?.email} disabled className="bg-gray-50" />
                                        <p className="text-[12px] text-muted-foreground">Email không thể thay đổi</p>
                                    </div>

                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nhập họ tên" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nhập số điện thoại" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-2">
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Lưu thay đổi
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => profileForm.reset()}>Hủy</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bảo mật</CardTitle>
                            <CardDescription>Quản lý mật khẩu và các tùy chọn bảo mật.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!user?.password && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Tài khoản này đăng nhập bằng Google/Facebook nên chưa có mật khẩu.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h3 className="font-medium mb-4">Đổi mật khẩu</h3>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mật khẩu hiện tại</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mật khẩu mới</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Ít nhất 6 ký tự" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Xác nhận mật khẩu</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" variant="default" disabled={saving}>
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Xác nhận đổi
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>Hủy</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Linked Accounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tài khoản liên kết</CardTitle>
                            <CardDescription>Kết nối tài khoản Google hoặc Zalo để đăng nhập nhanh hơn.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <LinkIcon className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Google</p>
                                        {user?.accounts?.some((acc: any) => acc.provider === 'google') ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Đã liên kết</span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Chưa liên kết</span>
                                        )}
                                    </div>
                                </div>
                                {user?.accounts?.some((acc: any) => acc.provider === 'google') ? (
                                    <Button variant="destructive" size="sm">Hủy liên kết</Button>
                                ) : (
                                    <Button variant="outline" size="sm">Liên kết</Button>
                                )}

                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <LinkIcon className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Zalo</p>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Chưa liên kết</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Liên kết</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
