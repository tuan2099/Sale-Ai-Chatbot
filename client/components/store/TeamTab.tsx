"use client";

import { useState, useEffect } from "react";
import {
    Users,
    UserPlus,
    MoreHorizontal,
    Shield,
    ShieldCheck,
    Trash2,
    Mail,
    Loader2,
    Check,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
    id: string;
    role: "ADMIN" | "AGENT";
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        image: string;
    };
}

interface TeamTabProps {
    storeId: string;
}

export function TeamTab({ storeId }: TeamTabProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("AGENT");
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/team/${storeId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error("Fetch members error:", error);
            toast.error("Không thể tải danh sách thành viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [storeId]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setIsInviting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/team/${storeId}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });

            if (res.ok) {
                toast.success("Đã thêm thành viên mới");
                setInviteEmail("");
                setShowInviteModal(false);
                fetchMembers();
            } else {
                const error = await res.json();
                toast.error(error.message || "Lỗi khi thêm thành viên");
            }
        } catch (error) {
            toast.error("Lỗi mạng khi thêm thành viên");
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/team/${storeId}/members/${memberId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success("Đã cập nhật vai trò");
                fetchMembers();
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật vai trò");
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi cửa hàng?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/team/${storeId}/members/${memberId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Đã xóa thành viên");
                fetchMembers();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa thành viên");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Quản lý đội ngũ</h2>
                    <p className="text-sm text-gray-500 mt-1">Mời nhân viên và quản trị viên cùng quản lý cửa hàng của bạn.</p>
                </div>
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <UserPlus className="h-4 w-4" /> Thêm thành viên
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm thành viên mới</DialogTitle>
                            <DialogDescription>
                                Nhập email của người dùng bạn muốn thêm vào cửa hàng này. Người này phải đã có tài khoản trên hệ thống.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email người dùng</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="user@example.com"
                                        className="pl-10"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vai trò</label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AGENT">Nhân viên (Agent)</SelectItem>
                                        <SelectItem value="ADMIN">Quản trị viên (Admin)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-gray-400">
                                    Admin có quyền quản lý cấu hình và nhân sự. Agent chỉ có quyền chat và quản lý khách hàng.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Hủy</Button>
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting || !inviteEmail}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                Thêm ngay
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Thành viên</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                    Chưa có thành viên nào khác trong đội ngũ.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={member.user.image} alt={member.user.name} />
                                                <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                                                    {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{member.user.name || "Chưa đặt tên"}</span>
                                                <span className="text-xs text-gray-500">{member.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "gap-1 font-bold text-[10px] py-0.5",
                                                member.role === "ADMIN"
                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                            )}
                                        >
                                            {member.role === "ADMIN" ? (
                                                <ShieldCheck className="h-3 w-3" />
                                            ) : (
                                                <Shield className="h-3 w-3" />
                                            )}
                                            {member.role === "ADMIN" ? "ADMIN" : "NHÂN VIÊN"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUpdateRole(member.id, member.role === "ADMIN" ? "AGENT" : "ADMIN")}>
                                                    Chuyển sang {member.role === "ADMIN" ? "Nhân viên" : "Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Xóa khỏi đội ngũ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-blue-50/50 border-blue-100 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Vai trò Quản trị viên (Admin)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Có toàn quyền quản lý cửa hàng, cấu hình AI, thêm/xóa nhân viên và xem báo cáo thống kê.
                            Hãy thận trọng khi cấp quyền này cho người khác.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-50/50 border-gray-200 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Vai trò Nhân viên (Agent)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Chỉ có quyền xem danh sách khách hàng, quản lý các cuộc hội thoại (Live Chat).
                            Thích hợp cho đội ngũ CSKH trực thuộc cửa hàng.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper for cn
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
