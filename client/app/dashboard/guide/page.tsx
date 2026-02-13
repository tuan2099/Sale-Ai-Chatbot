"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, MessageSquare, Users, Bot, Settings, Store } from "lucide-react";

export default function GuidePage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Hướng dẫn sử dụng</h1>
                <p className="text-muted-foreground">
                    Tài liệu hướng dẫn chi tiết cách sử dụng AI Agent Platform để quản lý và tự động hóa bán hàng.
                </p>
            </div>

            <Tabs defaultValue="getting-started" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
                    <TabsTrigger value="getting-started" className="flex flex-col gap-2 py-3">
                        <BookOpen className="h-5 w-5" />
                        <span>Bắt đầu</span>
                    </TabsTrigger>
                    <TabsTrigger value="stores" className="flex flex-col gap-2 py-3">
                        <Store className="h-5 w-5" />
                        <span>Cửa hàng</span>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex flex-col gap-2 py-3">
                        <MessageSquare className="h-5 w-5" />
                        <span>Hội thoại</span>
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="flex flex-col gap-2 py-3">
                        <Users className="h-5 w-5" />
                        <span>Khách hàng</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai-config" className="flex flex-col gap-2 py-3">
                        <Bot className="h-5 w-5" />
                        <span>Cấu hình AI</span>
                    </TabsTrigger>
                </TabsList>

                {/* GETTING STARTED */}
                <TabsContent value="getting-started" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng quan về hệ thống</CardTitle>
                            <CardDescription>Làm quen với giao diện và các chức năng chính.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Chào mừng bạn đến với <strong>AI Agent Platform</strong> - giải pháp toàn diện giúp bạn tự động hóa quy trình chăm sóc khách hàng và bán hàng đa kênh (Website, Facebook, Zalo).
                            </p>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Bước 1: Tạo cửa hàng</AccordionTrigger>
                                    <AccordionContent>
                                        Đầu tiên, bạn cần tạo một cửa hàng mới. Cửa hàng là nơi chứa toàn bộ dữ liệu về khách hàng, hội thoại và cấu hình AI riêng biệt cho từng thương hiệu hoặc chi nhánh của bạn.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Bước 2: Kết nối kênh bán hàng</AccordionTrigger>
                                    <AccordionContent>
                                        Sau khi tạo cửa hàng, hãy kết nối các kênh bán hàng như Fanpage Facebook, Zalo OA hoặc nhúng Widget vào Website của bạn để bắt đầu thu thập tin nhắn.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Bước 3: Cấu hình AI</AccordionTrigger>
                                    <AccordionContent>
                                        Thiết lập tính cách, nhập dữ liệu kiến thức (file, website, text) để AI có thể tự động trả lời khách hàng một cách chính xác nhất.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STORES */}
                <TabsContent value="stores" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản lý Cửa hàng</CardTitle>
                            <CardDescription>Cách tạo, chỉnh sửa và quản lý các cửa hàng.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Thêm cửa hàng mới:</strong> Tại màn hình Dashboard chính, nhấn vào nút "Thêm cửa hàng" và nhập tên cửa hàng.</li>
                                <li><strong>Chuyển đổi cửa hàng:</strong> Sử dụng menu bên trái hoặc nút "Đổi cửa hàng" để chuyển qua lại giữa các cửa hàng khác nhau.</li>
                                <li><strong>Cài đặt cửa hàng:</strong> Trong mỗi cửa hàng, bạn có thể cấu hình riêng về Widget chat, kết nối Facebook/Zalo, và quản lý nhân viên.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CHAT */}
                <TabsContent value="chat" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản lý Hội thoại (Live Chat)</CardTitle>
                            <CardDescription>Tương tác với khách hàng và giám sát AI.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p>Màn hình Hội thoại cho phép bạn chat trực tiếp với khách hàng từ tất cả các kênh.</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="border p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-4 w-4 text-blue-600" /> Chế độ AI Tự động</h3>
                                        <p className="text-sm text-gray-600">Mặc định AI sẽ tự động trả lời. Bạn có thể theo dõi cuộc hội thoại trong thời gian thực.</p>
                                    </div>
                                    <div className="border p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><UserIcon className="h-4 w-4 text-green-600" /> Chế độ Can thiệp</h3>
                                        <p className="text-sm text-gray-600">Khi bạn gửi tin nhắn thủ công, AI sẽ tạm dừng trong một khoảng thời gian để bạn tư vấn trực tiếp.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CUSTOMERS */}
                <TabsContent value="customers" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản lý Khách hàng (CRM)</CardTitle>
                            <CardDescription>Lưu trữ và quản lý thông tin khách hàng.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">Hệ thống tự động lưu thông tin khách hàng khi họ nhắn tin. Bạn cũng có thể:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Thêm thủ công:</strong> Tạo hồ sơ khách hàng mới.</li>
                                <li><strong>Gắn thẻ (Tags):</strong> Phân loại khách hàng (Ví dụ: VIP, Mới, Đã mua).</li>
                                <li><strong>Lịch sử:</strong> Xem lại toàn bộ lịch sử chat và đơn hàng của khách.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI CONFIG */}
                <TabsContent value="ai-config" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cấu hình & Huấn luyện AI</CardTitle>
                            <CardDescription>Làm cho AI thông minh hơn.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="ai-1">
                                    <AccordionTrigger>Nguồn dữ liệu (Knowledge Base)</AccordionTrigger>
                                    <AccordionContent>
                                        Nạp dữ liệu cho AI bằng cách:
                                        <ul className="list-disc pl-6 mt-2 space-y-1">
                                            <li>Nhập văn bản trực tiếp (Q&A).</li>
                                            <li>Tải lên tài liệu (PDF, Word, TXT).</li>
                                            <li>Crawl nội dung từ Website của bạn.</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="ai-2">
                                    <AccordionTrigger>Kịch bản & Từ khóa</AccordionTrigger>
                                    <AccordionContent>
                                        Thiết lập các câu trả lời cố định cho các từ khóa cụ thể. Ví dụ: Khách hỏi "giá", AI trả lời bảng giá.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="ai-3">
                                    <AccordionTrigger>Prompt hệ thống</AccordionTrigger>
                                    <AccordionContent>
                                        Tùy chỉnh "nhân cách" của AI (Ví dụ: Thân thiện, Chuyên nghiệp, Hài hước) và các quy tắc ứng xử.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
