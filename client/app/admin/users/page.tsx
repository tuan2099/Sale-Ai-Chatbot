'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    subscription: {
        plan: string;
        aiMessageCount: number;
    } | null;
    _count: {
        stores: number;
    };
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Edit Plan State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPlan, setNewPlan] = useState<string>('FREE');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const res = await fetch('http://localhost:5000/api/user/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 403) {
                toast.error("Bạn không có quyền truy cập trang này");
                router.push('/dashboard');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch users');

            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!selectedUser) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/user/admin/plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetUserId: selectedUser.id,
                    plan: newPlan
                })
            });

            if (!res.ok) throw new Error('Failed to update plan');

            toast.success(`Đã cập nhật gói cước cho ${selectedUser.name}`);
            setIsDialogOpen(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật gói cước");
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setNewPlan(user.subscription?.plan || 'FREE');
        setIsDialogOpen(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
                <Button onClick={fetchUsers} variant="outline">Làm mới</Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Gói cước</TableHead>
                            <TableHead>Số cửa hàng</TableHead>
                            <TableHead>AI Messages</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-purple-600">
                                        {user.subscription?.plan || 'FREE'}
                                    </span>
                                </TableCell>
                                <TableCell>{user._count.stores}</TableCell>
                                <TableCell>{user.subscription?.aiMessageCount || 0}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModal(user)}
                                    >
                                        Nâng cấp
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật gói cước</DialogTitle>
                        <DialogDescription>
                            Thay đổi gói dịch vụ cho người dùng <b>{selectedUser?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm">Gói hiện tại</label>
                            <div className="col-span-3 font-bold">
                                {selectedUser?.subscription?.plan || 'FREE'}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm">Gói mới</label>
                            <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn gói" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FREE">FREE (Miễn phí)</SelectItem>
                                    <SelectItem value="STANDARD">STANDARD (Gói Cơ bản)</SelectItem>
                                    <SelectItem value="PRO">PRO (Gói Chuyên nghiệp)</SelectItem>
                                    <SelectItem value="ENTERPRISE">ENTERPRISE (Gói Doanh nghiệp)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdatePlan}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
