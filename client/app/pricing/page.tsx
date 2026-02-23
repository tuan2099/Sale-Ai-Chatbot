"use client";
import { useState } from "react";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, Info, Star } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: number, code: string } | null>(null);
    const [qrData, setQrData] = useState<{ qrUrl: string, content: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async (planName: string, price: number, planCode: string) => {
        setSelectedPlan({ name: planName, price, code: planCode });
        setShowPaymentModal(true);
        setLoading(true);
        setQrData(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login if not logged in
                window.location.href = '/auth/login';
                return;
            }

            const res = await fetch('http://localhost:5000/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: planCode,
                    amount: price
                })
            });

            if (!res.ok) throw new Error('Failed to create payment');

            const data = await res.json();
            setQrData({ qrUrl: data.qrUrl, content: data.transferContent });
        } catch (error) {
            console.error(error);
            // toast.error("Có lỗi xảy ra khi tạo giao dịch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-black">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                        Nâng Cấp Tài Khoản
                    </h1>
                    <div className="flex justify-center">
                        <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Sale AI Free</h3>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase">Đang dùng</span>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">0</span>
                            <span className="text-gray-500 text-sm">/tháng</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-6 min-h-[60px]">
                            Gói miễn phí trải nghiệm các tính năng cơ bản.
                        </p>
                        <div className="space-y-4 mb-8 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ĐẶC QUYỀN GÓI NÀY:</p>
                            <ul className="space-y-3 text-sm">
                                {["Cửa hàng", "AI Chatbot", "Nhân viên", "Tin dụng AI", "Nguồn dữ liệu", "Sản phẩm", "Chế độ Chatbot", "Landing Page", "Công cụ tùy chỉnh", "Tin nhắn AI"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full">
                                            <Check className="h-3 w-3 text-blue-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button className="w-full" variant="outline" disabled>
                            Đang sử dụng
                        </Button>
                    </div>

                    {/* Standard Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-md border-2 border-blue-600 relative flex flex-col transform hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Khuyên dùng
                        </div>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-blue-600">Sale AI Standard</h3>
                            <span className="text-xs font-semibold text-blue-500 uppercase">Kinh doanh nhỏ</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 min-h-[60px]">
                            Giải pháp hoàn hảo để giải phóng chủ shop khỏi việc trực chat mệt mỏi.
                        </p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">349.000 đ</span>
                            <span className="text-gray-500 text-sm">/tháng</span>
                            <div className="flex items-center gap-1 text-xs text-orange-500 mt-2 font-medium">
                                <Star className="h-3 w-3 fill-current" />
                                <span>Hỗ trợ tương đương 3 nhân viên trực (Tiết kiệm ~15tr/tháng)</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ĐẶC QUYỀN GÓI NÀY:</p>
                            <ul className="space-y-3 text-sm">
                                {[
                                    "1 Cửa hàng & AI Agent thạo việc",
                                    "Kết nối đa kênh với 3 nền tảng",
                                    "2.000 tin nhắn / tháng ~ 200 khách hàng",
                                    "15 AI Website (Landing Page)",
                                    "2000 tin dụng AI",
                                    "Quản lý 30 sản phẩm linh hoạt",
                                    "Tạo được 3 Người dùng",
                                    "Bảng điều khiển & Kết nối 1 CRM"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full mt-0.5">
                                            <Check className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-lg"
                            onClick={() => handleUpgrade("Sale AI Standard", 349000, "STANDARD")}
                        >
                            Nâng cấp ngay
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Sale AI Pro</h3>
                            <span className="text-xs font-semibold text-blue-600 uppercase">Bùng nổ doanh số</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 min-h-[60px]">
                            Dành cho chuỗi cửa hàng có lượng khách lớn, cần tốc độ và sự chuyên nghiệp.
                        </p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">819.000 đ</span>
                            <span className="text-gray-500 text-sm">/tháng</span>
                            <div className="flex items-center gap-1 text-xs text-orange-500 mt-2 font-medium">
                                <Star className="h-3 w-3 fill-current" />
                                <span>Tương đương đội ngũ 6 nhân sự trực 24/7</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ĐẶC QUYỀN GÓI NÀY:</p>
                            <ul className="space-y-3 text-sm">
                                {[
                                    "3 Cửa hàng & Siêu AI Agent cao cấp",
                                    "Kết nối đa kênh với 5 nền tảng",
                                    "5.000 tin nhắn / tháng ~ 500 khách hàng",
                                    "40 AI Website (Landing Page)",
                                    "5.000 tin dụng AI",
                                    "Quản lý 100 sản phẩm cùng lúc",
                                    "Tạo được 10 Người dùng",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full mt-0.5">
                                            <Check className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            className="w-full" variant="outline"
                            onClick={() => handleUpgrade("Sale AI Pro", 819000, "PRO")}
                        >
                            Nâng cấp ngay
                        </Button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold">Sale AI Enterprise</h3>
                            <span className="text-xs font-semibold text-blue-600 uppercase">Kinh doanh đa kênh</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 min-h-[60px]">
                            Giải pháp không giới hạn cho các doanh nghiệp lớn muốn tự động hóa toàn diện.
                        </p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">3.199.000 đ</span>
                            <span className="text-gray-500 text-sm">/tháng</span>
                            <div className="flex items-center gap-1 text-xs text-orange-500 mt-2 font-medium">
                                <Star className="h-3 w-3 fill-current" />
                                <span>Phòng kinh doanh tự vận hành 100%</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ĐẶC QUYỀN GÓI NÀY:</p>
                            <ul className="space-y-3 text-sm">
                                {[
                                    "Không giới hạn Cửa hàng & AI Agent",
                                    "Kết nối đa kênh mọi nền tảng",
                                    "20.000 tin nhắn / tháng ~ 2.000 khách hàng",
                                    "Không giới hạn AI Website",
                                    "20.000 tin dụng AI",
                                    "Tùy chỉnh trí tuệ AI riêng biệt",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full mt-0.5">
                                            <Check className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            className="w-full" variant="outline"
                            onClick={() => handleUpgrade("Sale AI Enterprise", 3199000, "ENTERPRISE")}
                        >
                            Nâng cấp ngay
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Thanh Toán An Toàn</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-500">Đang tạo mã thanh toán...</p>
                                </div>
                            ) : qrData ? (
                                <div className="flex flex-col items-center space-y-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-1">Thanh toán cho gói</p>
                                        <p className="text-lg font-bold text-blue-600">{selectedPlan?.name}</p>
                                        <p className="text-2xl font-bold mt-2">{selectedPlan?.price.toLocaleString('vi-VN')} đ</p>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                        <img
                                            src={qrData.qrUrl}
                                            alt="Mã QR Thanh Toán"
                                            className="relative w-64 h-64 rounded-lg shadow-inner bg-white p-2"
                                        />
                                    </div>

                                    <div className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Nội dung chuyển khoản (Bắt buộc)</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <code className="bg-white dark:bg-black px-3 py-1.5 rounded border font-mono text-lg font-bold text-blue-600 select-all">
                                                {qrData.content}
                                            </code>
                                        </div>
                                        <p className="text-xs text-red-500 mt-2 italic">* Vui lòng nhập chính xác nội dung này</p>
                                    </div>

                                    <p className="text-center text-sm text-gray-500">
                                        Hệ thống sẽ tự động kích hoạt gói ngay khi nhận được tiền (thường trong 1-3 phút).
                                    </p>

                                    <Button onClick={() => setShowPaymentModal(false)} className="w-full" variant="outline">
                                        Tôi đã chuyển khoản
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-red-500">
                                    Không thể tạo mã thanh toán. Vui lòng thử lại.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
