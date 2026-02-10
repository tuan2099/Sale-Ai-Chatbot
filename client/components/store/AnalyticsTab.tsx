"use client";

import React, { useEffect, useState } from "react";
import {
    Card, CardContent, CardHeader, CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area,
    RadialBarChart, RadialBar
} from "recharts";
import {
    TrendingUp,
    ArrowUpRight, Bot,
    Inbox, Rocket, RefreshCcw, BarChart3, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface StatsData {
    totals: {
        customers: number;
        conversations: number;
        messages: number;
    };
    trend: Array<{
        date: string;
        conversations: number;
        messages: number;
        customers: number;
    }>;
}

export function AnalyticsTab({ storeId }: { storeId: string }) {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/stores/${storeId}/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const stats = await res.json();
                    setData(stats);
                }
            } catch (error) {
                console.error("Fetch stats error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [storeId]);

    if (loading) return <div className="h-40 flex items-center justify-center">Đang tải thống kê...</div>;
    if (!data) return <div>Không có dữ liệu thống kê.</div>;

    const radialData = [
        { name: "Tổng", value: data.totals.conversations || 1, fill: "#f1f5f9" },
        { name: "Thành công", value: data.totals.customers, fill: "#2563eb" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h2>
                <div className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-xl shadow-sm text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Tháng này
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-[#1a233b] text-white border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Rocket className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cập nhật</span>
                            </div>
                            <CardTitle className="text-xs text-gray-400 font-medium tracking-tight">
                                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-lg font-bold mb-1 leading-tight">Doanh thu tăng trưởng</h3>
                            <p className="text-blue-400 text-3xl font-black mb-6">0đ <span className="text-sm font-normal text-gray-400">tháng này</span></p>
                            <button className="text-xs font-bold flex items-center gap-2 text-white/80 hover:text-white transition-all group">
                                Xem thống kê <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-none bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Giao dịch</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex flex-col items-center justify-center text-center text-gray-400">
                            <Inbox className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs leading-relaxed">Chưa có giao dịch nào phát sinh.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-tight">Đơn hàng thành công</p>
                                <p className="text-4xl font-black text-gray-900 leading-none">0</p>
                                <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="h-3 w-3" /> +0% so với trước đó
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-tight">Tin nhắn mới</p>
                                <p className="text-4xl font-black text-gray-900 leading-none">{data.totals.messages}</p>
                                <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="h-3 w-3" /> +7% so với trước đó
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-tight">Cuộc hội thoại</p>
                                <p className="text-4xl font-black text-gray-900 leading-none">{data.totals.conversations}</p>
                                <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="h-3 w-3" /> +3% so với trước đó
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-bold">Xu hướng tin nhắn và hội thoại</CardTitle>
                                <CardDescription className="text-xs">Dữ liệu được cập nhật hàng ngày</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5 font-bold"><span className="h-2 w-2 rounded-full bg-blue-500" /> Tin nhắn</div>
                                <div className="flex items-center gap-1.5 font-bold"><span className="h-2 w-2 rounded-full bg-gray-900" /> Hội thoại</div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 px-2">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.trend}>
                                        <defs>
                                            <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            tickFormatter={(str) => str.split('-')[2]}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="messages" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMsg)" dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                                        <Area type="monotone" dataKey="conversations" stroke="#0f172a" strokeWidth={2} fill="transparent" dot={{ r: 3, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="text-center pb-0">
                            <CardTitle className="text-sm font-bold">Tỷ lệ chuyển đổi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="h-56 w-56 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={radialData} startAngle={90} endAngle={450}>
                                        <RadialBar
                                            background
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Tỷ lệ</p>
                                    <p className="text-3xl font-black text-gray-900 leading-none mt-2">
                                        {data.totals.conversations > 0 ? ((data.totals.customers / data.totals.conversations) * 100).toFixed(1) : "0.0"}%
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold pb-4">
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600" /> THÀNH CÔNG</div>
                                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-200" /> CHƯA THÀNH CÔNG</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold leading-none">Độ sẵn sàng của AI Agent</p>
                                        <p className="text-[10px] text-red-500 font-medium mt-1">Chưa sẵn sàng</p>
                                    </div>
                                </div>
                                <Badge className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full" >7%</Badge>
                            </div>
                            <Progress value={7} className="h-1.5 bg-gray-100" />

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                            <RefreshCcw className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold leading-none">Danh sách cần dọn dẹp</p>
                                            <p className="text-[10px] text-gray-400 mt-1">1/6 mục hoàn thành</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-[10px]">
                                        <span className="h-4 w-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold">2</span>
                                        <span className="h-4 w-4 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center font-bold">2</span>
                                    </div>
                                </div>
                                <Progress value={17} className="h-1.5 bg-gray-100" />
                                <p className="text-[10px] text-right text-gray-400 font-bold tracking-tighter mt-1 uppercase">17% Hoàn thành</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
