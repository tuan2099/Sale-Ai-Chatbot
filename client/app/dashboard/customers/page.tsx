"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    MessageSquare,
    User as UserIcon,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Calendar
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const CustomerSchema = z.object({
    name: z.string().min(1, "Họ tên là bắt buộc"),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    channel: z.string().min(1, "Kênh là bắt buộc"),
});

type CustomerFormValues = z.infer<typeof CustomerSchema>;

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterTab, setFilterTab] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(CustomerSchema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            gender: "MALE",
            channel: "Website",
        },
    });


    // Fetch Customers
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            let url = `http://localhost:5000/api/customers?q=${search}`;
            if (filterTab !== "all") {
                url += `&gender=${filterTab.toUpperCase()}`; // Example: using gender as a placeholder for visitor/lead if needed
            }
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
            toast.error("Không thể tải danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, filterTab]);

    const onCreateCustomer = async (values: CustomerFormValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:5000/api/customers", {
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

            if (!res.ok) throw new Error("Thêm khách hàng thất bại");

            toast.success("Thêm khách hàng thành công!");
            setIsAddModalOpen(false);
            form.reset();
            fetchCustomers();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi thêm khách hàng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteCustomer = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (!res.ok) throw new Error("Xóa khách hàng thất bại");

            toast.success("Đã xóa khách hàng");
            fetchCustomers();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa khách hàng");
        }
    };

    const onEditClick = (customer: any) => {
        setSelectedCustomer(customer);
        form.reset({
            name: customer.name,
            email: customer.email || "",
            phoneNumber: customer.phoneNumber || "",
            gender: customer.gender || "MALE",
            channel: customer.channel || "Website",
        });
        setIsEditModalOpen(true);
    };

    const onUpdateCustomer = async (values: CustomerFormValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:5000/api/customers/${selectedCustomer.id}`, {
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

            if (!res.ok) throw new Error("Cập nhật khách hàng thất bại");

            toast.success("Cập nhật khách hàng thành công!");
            setIsEditModalOpen(false);
            fetchCustomers();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-blue-600 border-blue-600">
                        Hướng dẫn (?)
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">2</Badge>
                        <MessageSquare className="h-5 w-5" />
                    </Button>

                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Tạo khách hàng
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Thêm khách hàng mới</DialogTitle>
                                <DialogDescription>
                                    Nhập thông tin cơ bản cho khách hàng của bạn.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onCreateCustomer as any)} className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập tên khách hàng" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số điện thoại</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0912..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giới tính</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn giới tính" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="MALE">Nam</SelectItem>
                                                            <SelectItem value="FEMALE">Nữ</SelectItem>
                                                            <SelectItem value="OTHER">Khác</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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
                                        name="channel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kênh tiếp cận</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn kênh" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Website">Website</SelectItem>
                                                        <SelectItem value="Zalo">Zalo</SelectItem>
                                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Thêm khách hàng
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
                                <DialogDescription>
                                    Cập nhật thông tin khách hàng.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onUpdateCustomer as any)} className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số điện thoại</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giới tính</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn giới tính" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="MALE">Nam</SelectItem>
                                                            <SelectItem value="FEMALE">Nữ</SelectItem>
                                                            <SelectItem value="OTHER">Khác</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="channel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kênh tiếp cận</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn kênh" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Website">Website</SelectItem>
                                                        <SelectItem value="Zalo">Zalo</SelectItem>
                                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
                    <TabsList className="bg-transparent border-b rounded-none h-auto p-0 gap-6">
                        <TabsTrigger value="all" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-0 pb-2">
                            Khách hàng
                        </TabsTrigger>
                        <TabsTrigger value="VISITOR" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-0 pb-2">
                            Visitor
                        </TabsTrigger>
                        <TabsTrigger value="LEADS" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-0 pb-2">
                            Leads
                        </TabsTrigger>
                        <TabsTrigger value="broadcast" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-0 pb-2 text-gray-400">
                            Gửi hàng loạt
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Bộ lọc
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">KHÁCH HÀNG</TableHead>
                            <TableHead className="font-semibold text-gray-600">SỐ ĐIỆN THOẠI</TableHead>
                            <TableHead className="font-semibold text-gray-600">EMAIL</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-center">GIỚI TÍNH</TableHead>
                            <TableHead className="font-semibold text-gray-600">KÊNH</TableHead>
                            <TableHead className="font-semibold text-gray-600">LẦN CUỐI TƯƠNG TÁC</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-right">THAO TÁC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Không có khách hàng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={customer.image} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{customer.name}</span>
                                                <span className="text-xs text-gray-500 uppercase">ID: {customer.id.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{customer.phoneNumber || "-"}</TableCell>
                                    <TableCell className="text-gray-600">{customer.email || "-"}</TableCell>
                                    <TableCell className="text-center text-gray-600">
                                        {customer.gender === "MALE" ? "Nam" : customer.gender === "FEMALE" ? "Nữ" : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "px-2 py-0.5 rounded-sm font-normal text-[10px]",
                                                customer.channel === "Website"
                                                    ? "bg-green-50 text-green-600 border-green-200"
                                                    : "bg-blue-50 text-blue-600 border-blue-200"
                                            )}
                                        >
                                            {customer.channel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600 text-sm">
                                        {new Date(customer.lastInteraction).toLocaleString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-blue-600">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-sm font-medium cursor-pointer hover:underline">Xem hội thoại</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onEditClick(customer)}>Chỉnh sửa</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => onDeleteCustomer(customer.id)}>Xóa</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
