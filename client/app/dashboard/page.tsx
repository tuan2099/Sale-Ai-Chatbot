"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Plus, ArrowRight, Loader2, Bot } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const StoreSchema = z.object({
    name: z.string().min(1, "Tên cửa hàng là bắt buộc"),
    description: z.string().optional(),
    aiName: z.string().min(1, "Tên AI Agent là bắt buộc"),
});

type StoreFormValues = z.infer<typeof StoreSchema>;

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<StoreFormValues>({
        resolver: zodResolver(StoreSchema),
        defaultValues: {
            name: "",
            description: "",
            aiName: "AI Assistant",
        },
    });

    const fetchStores = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:5000/api/stores", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setStores(data.stores);
            }
        } catch (error) {
            console.error("Failed to fetch stores", error);
            toast.error("Không thể tải danh sách cửa hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            router.replace("/dashboard");
        }

        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!storedToken) {
            router.push("/login");
        } else {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            fetchStores();
        }
    }, [searchParams, router]);

    const onCreateStore = async (values: StoreFormValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error("Thêm cửa hàng thất bại");

            toast.success("Thêm cửa hàng thành công!");
            setIsAddModalOpen(false);
            form.reset();
            fetchStores();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi thêm cửa hàng");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Danh sách cửa hàng</h1>
                    <p className="text-gray-500 mt-1">Chọn cửa hàng để bắt đầu quản lý</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Thêm cửa hàng
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Thêm cửa hàng mới</DialogTitle>
                            <DialogDescription>
                                Thiết lập cửa hàng và AI Agent riêng biệt để chăm sóc khách hàng.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onCreateStore)} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên cửa hàng</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ví dụ: Shop Thời Trang A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="aiName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên AI Agent</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ví dụ: Trợ lý bán hàng" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả cửa hàng</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Mô tả ngắn về cửa hàng của bạn" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Tạo cửa hàng
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : stores.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Chưa có cửa hàng nào</h3>
                    <p className="text-gray-500 mb-6">Hãy tạo cửa hàng đầu tiên của bạn để bắt đầu.</p>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Tạo ngay
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store: any) => (
                        <Card
                            key={store.id}
                            className="hover:shadow-md transition-shadow cursor-pointer group border-gray-200"
                            onClick={() => router.push(`/dashboard/stores/${store.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal">
                                        <Bot className="h-3 w-3 mr-1" />
                                        {store.aiName}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">{store.name}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                    {store.description || "Chưa có mô tả"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-gray-900">{store._count?.customers || 0}</span> Khách hàng
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-gray-900">{store._count?.scripts || 0}</span> Kịch bản
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 hover:text-blue-600 group-hover:text-blue-600">
                                    Quản lý cửa hàng <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
