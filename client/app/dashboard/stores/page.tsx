"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Search,
    Plus,
    MoreHorizontal,
    Store as StoreIcon,
    Bot,
    Users,
    Loader2,
    Calendar,
    Edit,
    Trash
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const StoreSchema = z.object({
    name: z.string().min(1, "Tên cửa hàng là bắt buộc"),
    description: z.string().optional(),
    aiName: z.string().min(1, "Tên AI Agent là bắt buộc"),
});

type StoreFormValues = z.infer<typeof StoreSchema>;

export default function StoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

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
            const res = await fetch(`http://localhost:5000/api/stores?q=${search}`, {
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
        const timer = setTimeout(() => {
            fetchStores();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const onCreateStore = async (values: StoreFormValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:5000/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

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

    const onDeleteStore = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa cửa hàng này? Tất cả dữ liệu liên quan sẽ bị mất.")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:5000/api/stores/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (!res.ok) throw new Error("Xóa cửa hàng thất bại");

            toast.success("Đã xóa cửa hàng");
            fetchStores();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa cửa hàng");
        }
    };

    const onEditClick = (store: any) => {
        setSelectedStore(store);
        form.reset({
            name: store.name,
            description: store.description || "",
            aiName: store.aiName || "AI Assistant",
        });
        setIsEditModalOpen(true);
    };

    const onUpdateStore = async (values: StoreFormValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:5000/api/stores/${selectedStore.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(values)
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (!res.ok) throw new Error("Cập nhật cửa hàng thất bại");

            toast.success("Cập nhật cửa hàng thành công!");
            setIsEditModalOpen(false);
            fetchStores();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý cửa hàng</h1>
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

            <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm cửa hàng..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cửa hàng</TableHead>
                                <TableHead>AI Agent</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Đang tải danh sách...
                                    </TableCell>
                                </TableRow>
                            ) : stores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        Chưa có cửa hàng nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stores.map((store: any) => (
                                    <TableRow key={store.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                    <StoreIcon className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{store.name}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{store.description}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    <Bot className="mr-1 h-3 w-3" /> {store.aiName}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{store._count?.customers || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/stores/${store.id}`)}>
                                                        <Search className="mr-2 h-4 w-4" /> Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditClick(store)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDeleteStore(store.id)}>
                                                        <Trash className="mr-2 h-4 w-4" /> Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa cửa hàng</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cửa hàng hoặc thay đổi cấu hình AI Agent.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onUpdateStore)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên cửa hàng</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                                <Input {...field} />
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
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Lưu thay đổi
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
