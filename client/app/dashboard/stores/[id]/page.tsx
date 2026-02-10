"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    Store,
    Bot,
    Save,
    Calendar,
    Users,
    Info,
    Palette,
    MessageSquare,
    Settings,
    Database,
    Plus,
    Globe,
    FileUp,
    Trash2,
    BarChart3,
    LayoutDashboard
} from "lucide-react";
import { AnalyticsTab } from "@/components/store/AnalyticsTab";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamTab } from "@/components/store/TeamTab";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { CRMAside } from "@/components/chat/CRMAside";

const AIConfigSchema = z.object({
    aiName: z.string().min(1, "Tên AI Agent là bắt buộc"),
    aiDescription: z.string().optional(),
    aiPriorityInstructions: z.string().optional(),
    aiIdentity: z.string().optional(),
    aiRequirements: z.string().optional(),
    aiExceptions: z.string().optional(),
    aiStyle: z.string().optional(),
    image: z.string().optional(),
    // Widget fields
    widgetColor: z.string().optional(),
    widgetImage: z.string().optional(),
    widgetFont: z.string().optional(),
    widgetWelcomeMsg: z.string().optional(),
    widgetSuggestions: z.string().optional(),
    widgetWelcomeSuggestions: z.string().optional(),
    widgetLeadFields: z.string().optional(),
});

type AIConfigValues = z.infer<typeof AIConfigSchema>;

interface Knowledge {
    id: string;
    name: string;
    content?: string;
    type: "WEBSITE" | "FILE" | "MANUAL";
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    url?: string;
    fileUrl?: string;
    createdAt: string;
}

export default function StoreDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("ai");
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
    const [loadingKnowledge, setLoadingKnowledge] = useState(false);

    // Live Chat & CRM State
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [chatSearch, setChatSearch] = useState("");

    // Modals
    const [showManualModal, setShowManualModal] = useState(false);
    const [showWebsiteModal, setShowWebsiteModal] = useState(false);
    const [showFileModal, setShowFileModal] = useState(false);

    // Manual Input Form State
    const [manualName, setManualName] = useState("");
    const [manualContent, setManualContent] = useState("");
    const [isSavingManual, setIsSavingManual] = useState(false);

    // Website Input Form State
    const [websiteName, setWebsiteName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [isSavingWebsite, setIsSavingWebsite] = useState(false);

    // File Input Form State
    const [fileName, setFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSavingFile, setIsSavingFile] = useState(false);

    const form = useForm<AIConfigValues>({
        resolver: zodResolver(AIConfigSchema),
        defaultValues: {
            aiName: "",
            aiDescription: "",
            aiPriorityInstructions: "",
            aiIdentity: "",
            aiRequirements: "",
            aiExceptions: "",
            aiStyle: "",
            widgetColor: "#2563eb",
            widgetImage: "",
            widgetFont: "Inter",
            widgetWelcomeMsg: "Chào bạn! Tôi có thể giúp gì cho bạn?",
            widgetSuggestions: "",
            widgetWelcomeSuggestions: "",
            widgetLeadFields: "name,email,phoneNumber",
        },
    });

    // Chat Fetching Functions
    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Fetch conversations error:", error);
        }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/messages/${convId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Fetch messages error:", error);
        }
    };

    const fetchCRMData = async (customerId: string) => {
        try {
            const token = localStorage.getItem("token");
            // Tags for store
            const tagsRes = await fetch(`http://localhost:5000/api/conversations/tags/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (tagsRes.ok) setAllTags(await tagsRes.json());

            // Notes for customer
            const notesRes = await fetch(`http://localhost:5000/api/conversations/notes/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (notesRes.ok) setNotes(await notesRes.json());
        } catch (error) {
            console.error("Fetch CRM data error:", error);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedConvId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/messages/${selectedConvId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                const newMsg = await res.json();
                setMessages(prev => [...prev, newMsg]);
                fetchConversations(); // Update last message
            }
        } catch (error) {
            console.error("Send message error:", error);
        }
    };

    const handleAddNote = async (content: string) => {
        const conversation = conversations.find(c => c.id === selectedConvId);
        if (!conversation) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/notes/${conversation.customer.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                const newNote = await res.json();
                setNotes(prev => [newNote, ...prev]);
                toast.success("Đã lưu ghi chú");
            }
        } catch (error) {
            console.error("Add note error:", error);
        }
    };

    const handleUpdateConvStatus = async (convId: string, status: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/${convId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchConversations();
            }
        } catch (error) {
            console.error("Update status error:", error);
        }
    };

    const handleAddTagToConv = async (tagId: string) => {
        const conversation = conversations.find(c => c.id === selectedConvId);
        if (!conversation) return;

        const currentTagIds = conversation.tags.map((t: any) => t.id);
        if (currentTagIds.includes(tagId)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/${selectedConvId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tagIds: [...currentTagIds, tagId] })
            });
            if (res.ok) {
                toast.success("Đã gắn thẻ");
                fetchConversations();
            }
        } catch (error) {
            console.error("Add tag error:", error);
        }
    };

    const handleRemoveTagFromConv = async (tagId: string) => {
        const conversation = conversations.find(c => c.id === selectedConvId);
        if (!conversation) return;

        const currentTagIds = conversation.tags.map((t: any) => t.id);
        const newTagIds = currentTagIds.filter((id: string) => id !== tagId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/conversations/${selectedConvId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tagIds: newTagIds })
            });
            if (res.ok) {
                fetchConversations();
            }
        } catch (error) {
            console.error("Remove tag error:", error);
        }
    };

    const handleAddManualKnowledge = async () => {
        if (!manualName || !manualContent) {
            toast.error("Vui lòng nhập tên và nội dung");
            return;
        }

        setIsSavingManual(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/knowledge/${params.id}/manual`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: manualName, content: manualContent })
            });

            if (res.ok) {
                toast.success("Đã thêm nguồn dữ liệu");
                setShowManualModal(false);
                setManualName("");
                setManualContent("");
                fetchKnowledge();
            } else {
                toast.error("Thêm thất bại");
            }
        } catch (error) {
            console.error("Add manual knowledge error:", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsSavingManual(false);
        }
    };

    const handleAddWebsiteKnowledge = async () => {
        if (!websiteName || !websiteUrl) {
            toast.error("Vui lòng nhập tên và URL");
            return;
        }

        setIsSavingWebsite(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/knowledge/${params.id}/website`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: websiteName, url: websiteUrl })
            });

            if (res.ok) {
                toast.success("Đã bắt đầu quét website");
                setShowWebsiteModal(false);
                setWebsiteName("");
                setWebsiteUrl("");
                fetchKnowledge();
            } else {
                toast.error("Quét thất bại");
            }
        } catch (error) {
            console.error("Add website knowledge error:", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsSavingWebsite(false);
        }
    };

    const handleAddFileKnowledge = async () => {
        if (!fileName || !selectedFile) {
            toast.error("Vui lòng nhập tên và chọn file");
            return;
        }

        setIsSavingFile(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("name", fileName);
            formData.append("file", selectedFile);

            const res = await fetch(`http://localhost:5000/api/knowledge/${params.id}/file`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                toast.success("Đã tải tài liệu lên");
                setShowFileModal(false);
                setFileName("");
                setSelectedFile(null);
                fetchKnowledge();
            } else {
                toast.error("Tải lên thất bại");
            }
        } catch (error) {
            console.error("Add file knowledge error:", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsSavingFile(false);
        }
    };

    const fetchStore = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:5000/api/stores/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setStore(data);
                form.reset({
                    aiName: data.aiName || "AI Assistant",
                    aiDescription: data.aiDescription || "",
                    aiPriorityInstructions: data.aiPriorityInstructions || "",
                    aiIdentity: data.aiIdentity || "",
                    aiRequirements: data.aiRequirements || "",
                    aiExceptions: data.aiExceptions || "",
                    aiStyle: data.aiStyle || "POLITE",
                    image: data.image || "",
                    widgetColor: data.widgetColor || "#2563eb",
                    widgetImage: data.widgetImage || "",
                    widgetFont: data.widgetFont || "Inter",
                    widgetWelcomeMsg: data.widgetWelcomeMsg || "Chào bạn! Tôi có thể giúp gì cho bạn?",
                    widgetSuggestions: data.widgetSuggestions || "",
                    widgetWelcomeSuggestions: data.widgetWelcomeSuggestions || "",
                    widgetLeadFields: data.widgetLeadFields || "name,email,phoneNumber",
                });
            } else {
                toast.error("Không tìm thấy cửa hàng");
                router.push("/dashboard/stores");
            }
        } catch (error) {
            console.error("Failed to fetch store", error);
            toast.error("Có lỗi xảy ra khi tải thông tin cửa hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchKnowledge = async () => {
        setLoadingKnowledge(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/knowledge/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setKnowledges(data);
            }
        } catch (error) {
            console.error("Failed to fetch knowledge", error);
        } finally {
            setLoadingKnowledge(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchStore();
            fetchKnowledge();
            fetchConversations();
        }
    }, [params.id]);

    useEffect(() => {
        if (selectedConvId) {
            const conversation = conversations.find(c => c.id === selectedConvId);
            fetchMessages(selectedConvId);
            if (conversation) {
                fetchCRMData(conversation.customer.id);
            }
        }
    }, [selectedConvId]);

    // Polling for new messages
    useEffect(() => {
        let interval: any;
        if (selectedConvId) {
            interval = setInterval(() => {
                fetchMessages(selectedConvId);
                fetchConversations();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedConvId]);

    const onUpdateAI = async (values: AIConfigValues) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/stores/${params.id}`, {
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

            if (!res.ok) throw new Error("Cập nhật thất bại");

            toast.success("Cập nhật cấu hình thành công!");
            fetchStore();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image" | "widgetImage") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                form.setValue(fieldName, data.url);
                toast.success("Tải ảnh lên thành công!");
            } else {
                toast.error("Tải ảnh lên thất bại");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Có lỗi xảy ra khi tải ảnh");
        }
    };

    const deleteKnowledge = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nguồn dữ liệu này?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/knowledge/${params.id}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Đã xóa nguồn dữ liệu");
                fetchKnowledge();
            }
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!store) return null;

    const leadFieldsOptions = [
        { id: "name", label: "Tên khách hàng" },
        { id: "email", label: "Email" },
        { id: "phoneNumber", label: "Số điện thoại" },
        { id: "address", label: "Địa chỉ" },
        { id: "note", label: "Ghi chú thêm" },
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/stores")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {store.name}
                        <Badge variant="outline" className="ml-2 font-normal">Cửa hàng</Badge>
                    </h1>
                    <p className="text-gray-500 text-sm">Quản lý cấu hình và dữ liệu cho AI Agent của bạn.</p>
                </div>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Info Card & Navigation - Sticky on desktop */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-sm border-none bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-600" /> Thông tin tổng quan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Store className="h-6 w-6 text-gray-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium">Tên cửa hàng</p>
                                        <p className="text-lg font-bold truncate">{store.name}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="h-4 w-4" /> Khách hàng
                                        </div>
                                        <span className="font-bold">{store._count?.customers || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar className="h-4 w-4" /> Ngày tạo
                                        </div>
                                        <span className="font-medium text-gray-700">
                                            {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-none bg-white p-2">
                            <TabsList className="!h-auto flex flex-col bg-transparent gap-2 p-0 ">
                                <TabsTrigger value="analytics" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <BarChart3 className="h-4 w-4" /> Thống kê
                                </TabsTrigger>
                                <TabsTrigger value="ai" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Bot className="h-4 w-4" /> Cấu hình AI
                                </TabsTrigger>
                                <TabsTrigger value="chat" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <MessageSquare className="h-4 w-4" /> Live Chat
                                </TabsTrigger>
                                <TabsTrigger value="widget" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Palette className="h-4 w-4" /> Giao diện Chat
                                </TabsTrigger>
                                <TabsTrigger value="knowledge" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Database className="h-4 w-4" /> Nguồn dữ liệu
                                </TabsTrigger>
                                <TabsTrigger value="leads" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Settings className="h-4 w-4" /> Thu thập Leads
                                </TabsTrigger>
                                <TabsTrigger value="integration" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Store className="h-4 w-4" /> Nhúng Website
                                </TabsTrigger>
                                <TabsTrigger value="team" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all border border-transparent data-[state=active]:border-blue-100 rounded-lg">
                                    <Users className="h-4 w-4" /> Đội ngũ
                                </TabsTrigger>
                            </TabsList>
                        </Card>
                    </div>

                    {/* Main Config Area */}
                    <div className="lg:col-span-3">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onUpdateAI)} className="space-y-6">
                                <div className="flex items-center justify-end gap-3 bg-white p-3 rounded-xl shadow-sm mb-6 sticky top-6 z-10 border border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.open(`http://localhost:3000/widget/${params.id}`, "_blank")}
                                        className="gap-2"
                                    >
                                        <Globe className="h-4 w-4" /> Xem thử Widget
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        {isSubmitting ? "Đang lưu..." : "Lưu tất cả"}
                                    </Button>
                                </div>

                                <TabsContent value="analytics" className="mt-0">
                                    <AnalyticsTab storeId={params.id as string} />
                                </TabsContent>

                                <TabsContent value="team" className="mt-0">
                                    <TeamTab storeId={params.id as string} />
                                </TabsContent>

                                <TabsContent value="chat" className="mt-0 h-[calc(100vh-280px)] min-h-[600px]">
                                    <Card className="shadow-sm border-none bg-white h-full overflow-hidden flex">
                                        <div className="w-80 h-full border-r">
                                            <ConversationList
                                                conversations={conversations}
                                                selectedId={selectedConvId}
                                                onSelect={setSelectedConvId}
                                                searchTerm={chatSearch}
                                                onSearchChange={setChatSearch}
                                            />
                                        </div>
                                        <div className="flex-1 h-full relative">
                                            {selectedConvId ? (
                                                <div className="flex h-full">
                                                    <div className="flex-1 h-full">
                                                        <ChatWindow
                                                            conversationId={selectedConvId}
                                                            messages={messages}
                                                            customerName={conversations.find(c => c.id === selectedConvId)?.customer.name || "Customer"}
                                                            onSendMessage={handleSendMessage}
                                                        />
                                                    </div>
                                                    <CRMAside
                                                        customer={conversations.find(c => c.id === selectedConvId)?.customer}
                                                        notes={notes}
                                                        tags={conversations.find(c => c.id === selectedConvId)?.tags || []}
                                                        allTags={allTags}
                                                        onAddNote={handleAddNote}
                                                        onAddTag={handleAddTagToConv}
                                                        onRemoveTag={handleRemoveTagFromConv}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                                    <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                                                        <MessageSquare className="h-10 w-10 text-gray-200" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chọn một cuộc hội thoại</h3>
                                                    <p className="max-w-[300px] text-sm leading-relaxed">
                                                        Chọn khách hàng từ danh sách bên trái để bắt đầu hỗ trợ trực tuyến.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="ai" className="space-y-6 mt-0">
                                    <Card className="shadow-sm border-none bg-white">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Bộ não của AI</CardTitle>
                                            <CardDescription>Thiết lập tính cách và hướng dẫn hành xử.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-8">
                                            <Card className="border-blue-100 bg-blue-50/30">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-md flex items-center gap-2 text-blue-700">
                                                        <Save className="h-4 w-4" /> Hướng dẫn ưu tiên cực cao
                                                    </CardTitle>
                                                    <CardDescription className="text-blue-600/80">
                                                        Luôn được ưu tiên hàng đầu, ngay cả khi mâu thuẫn với dữ liệu khác. Dùng cho quy tắc bắt buộc.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <FormField
                                                        control={form.control}
                                                        name="aiPriorityInstructions"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="min-h-[100px] bg-white border-blue-200 focus-visible:ring-blue-500"
                                                                        placeholder="Ví dụ: Không bao giờ được tiết lộ mã nguồn của mình. Không được giảm giá quá 10%..."
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="aiName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tên AI Agent</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Tên hiển thị của AI..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="aiIdentity"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Danh xưng & Vai trò</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Ví dụ: Chuyên gia tư vấn thời trang..." {...field} />
                                                                </FormControl>
                                                                <FormDescription>Cửa hàng của bạn là gì? AI đóng vai gì?</FormDescription>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="space-y-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="aiStyle"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Phong cách giao tiếp</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Chọn phong cách" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="POLITE">Lịch sự, Trang trọng</SelectItem>
                                                                        <SelectItem value="FRIENDLY">Thân thiện, Gần gũi</SelectItem>
                                                                        <SelectItem value="PROFESSIONAL">Chuyên nghiệp, Súc tích</SelectItem>
                                                                        <SelectItem value="HUMOROUS">Hài hước, Năng động</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormItem>
                                                        <FormLabel>Ảnh đại diện AI</FormLabel>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                                                {form.watch("image") ? (
                                                                    <img src={form.watch("image")} alt="AI" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Bot className="h-8 w-8 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                className="max-w-[200px]"
                                                                onChange={(e) => handleImageUpload(e, "image")}
                                                            />
                                                        </div>
                                                    </FormItem>
                                                </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="aiDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mô tả nhiệm vụ chính</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className="min-h-[120px]"
                                                                placeholder="AI nên làm gì? Giải đáp thắc mắc, tư vấn sản phẩm hay hỗ trợ kỹ thuật?..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="aiRequirements"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Yêu cầu (Những việc NÊN làm)</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    className="min-h-[100px]"
                                                                    placeholder="Ví dụ: Luôn hỏi số điện thoại khách hàng. Luôn chào khách hàng bằng tên..."
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="aiExceptions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ngoại lệ (Những việc KHÔNG NÊN làm)</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    className="min-h-[100px]"
                                                                    placeholder="Ví dụ: Không bàn luận về chính trị. Không so sánh với đối thủ cạnh tranh..."
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="knowledge" className="space-y-6 mt-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold">Nguồn kiến thức</h3>
                                            <p className="text-sm text-gray-500">AI sẽ dựa vào các nguồn này để trả lời khách hàng.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setShowWebsiteModal(true)} className="gap-2">
                                                <Globe className="h-4 w-4" /> Quét Website
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setShowFileModal(true)} className="gap-2">
                                                <FileUp className="h-4 w-4" /> Tải File
                                            </Button>
                                            <Button type="button" variant="default" size="sm" onClick={() => setShowManualModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                                <Plus className="h-4 w-4" /> Thêm thủ công
                                            </Button>
                                        </div>
                                    </div>

                                    {loadingKnowledge ? (
                                        <div className="py-12 flex justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {knowledges.map((k) => (
                                                <Card key={k.id} className="shadow-sm border-gray-100 hover:border-blue-200 transition-colors group">
                                                    <CardHeader className="p-4 pb-2">
                                                        <div className="flex items-start justify-between">
                                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                {k.type === "WEBSITE" && <Globe className="h-4 w-4" />}
                                                                {k.type === "FILE" && <FileUp className="h-4 w-4" />}
                                                                {k.type === "MANUAL" && <Database className="h-4 w-4" />}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => deleteKnowledge(k.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <CardTitle className="text-sm font-bold mt-2 truncate">{k.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <div className="flex items-center justify-between mt-2">
                                                            <Badge variant={k.status === "COMPLETED" ? "default" : "secondary"} className={cn("text-[10px] uppercase font-bold", k.status === "COMPLETED" ? "bg-green-100 text-green-700 hover:bg-green-100" : "")}>
                                                                {k.status === "COMPLETED" ? "Đã sẵn sàng" : "Đang xử lý"}
                                                            </Badge>
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(k.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {knowledges.length === 0 && (
                                                <div className="col-span-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                                    <Database className="h-12 w-12 mb-4 opacity-20" />
                                                    <p className="text-sm">Chưa có nguồn dữ liệu nào.</p>
                                                    <p className="text-xs">Hãy thêm kiến thức để AI thông minh hơn.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="widget" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Card className="shadow-sm border-none bg-white">
                                            <CardHeader>
                                                <CardTitle className="text-lg">Tùy chỉnh Widget</CardTitle>
                                                <CardDescription>Thay đổi giao diện bong bóng chat trên web.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="widgetColor"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Màu chủ đạo</FormLabel>
                                                            <div className="flex gap-4">
                                                                <FormControl>
                                                                    <Input type="color" className="h-10 w-20 p-1" {...field} />
                                                                </FormControl>
                                                                <Input value={field.value} onChange={field.onChange} className="flex-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="widgetFont"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Font chữ</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn font chữ" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Inter">Inter (Mặc định)</SelectItem>
                                                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                                                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                                                                    <SelectItem value="Outfit">Outfit</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="widgetWelcomeMsg"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Lời chào mừng</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Chào bạn! Tôi có thể giúp gì cho bạn?..." {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="widgetSuggestions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Câu hỏi gợi ý (Ngẫu nhiên)</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Mỗi câu một dòng..."
                                                                    className="min-h-[100px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>Hiển thị các nút gợi ý khi khách hàng click vào chat.</FormDescription>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="widgetWelcomeSuggestions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Gợi ý nổi bật (Lời chào)</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Mỗi câu một dòng..."
                                                                    className="min-h-[100px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>Gợi ý xuất hiện ngay cạnh bong bóng chat khi chưa mở.</FormDescription>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-6">
                                            <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Xem trước giao diện</h4>
                                            <div className="border-2 border-dashed rounded-2xl aspect-[4/5] flex items-center justify-center bg-gray-50 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-white shadow-2xl m-4 rounded-xl flex flex-col border border-gray-100">
                                                    <div className="p-4 border-b flex items-center gap-3" style={{ backgroundColor: form.watch("widgetColor") }}>
                                                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                                            <Bot className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{form.watch("aiName")}</p>
                                                            <p className="text-[10px] text-white/80">Trực tuyến</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 p-4 space-y-4">
                                                        <div className="flex gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                <Bot className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                                                                {form.watch("widgetWelcomeMsg")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 border-t">
                                                        <div className="h-10 rounded-full bg-gray-50 border flex items-center px-4 text-gray-400 text-sm">
                                                            Nhập tin nhắn...
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-10 right-10">
                                                    <div className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center" style={{ backgroundColor: form.watch("widgetColor") }}>
                                                        <MessageSquare className="h-7 w-7 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="leads" className="space-y-6 mt-0">
                                    <Card className="shadow-sm border-none bg-white">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Form thu thập thông tin (Leads)</CardTitle>
                                            <CardDescription>Yêu cầu khách hàng cung cấp thông tin trước khi chat.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                {leadFieldsOptions.map((option) => (
                                                    <div key={option.id} className="flex items-center space-x-3 space-y-0 border p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <Checkbox
                                                            id={option.id}
                                                            checked={form.watch("widgetLeadFields")?.split(",").includes(option.id)}
                                                            onCheckedChange={(checked) => {
                                                                const current = form.getValues("widgetLeadFields")?.split(",") || [];
                                                                const updated = checked
                                                                    ? [...current, option.id]
                                                                    : current.filter((val) => val !== option.id);
                                                                form.setValue("widgetLeadFields", updated.filter(v => v).join(","));
                                                            }}
                                                        />
                                                        <label htmlFor={option.id} className="text-sm font-medium leading-none cursor-pointer">
                                                            {option.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator />

                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                                                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                                <p className="text-sm text-blue-800">
                                                    Thông tin này sẽ giúp bạn phân loại khách hàng và tự động cập nhật vào hệ thống CRM.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="integration" className="space-y-6 mt-0">
                                    <Card className="shadow-sm border-none bg-white">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Nhúng vào Website của bạn</CardTitle>
                                            <CardDescription>Copy đoạn mã dưới đây và dán vào cuối thẻ &lt;body&gt; trên website của bạn.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-blue-400 relative group">
                                                <div className="overflow-x-auto whitespace-pre">
                                                    {`<script src="http://localhost:3000/embed.js?id=${params.id}"></script>`}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`<script src="http://localhost:3000/embed.js?id=${params.id}"></script>`);
                                                        toast.success("Đã sao chép mã nhúng!");
                                                    }}
                                                >
                                                    Copy
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-bold border-b pb-2">Hướng dẫn chi tiết</h4>
                                                <ul className="space-y-3 text-sm text-gray-600">
                                                    <li className="flex gap-2">
                                                        <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 rounded-full">1</Badge>
                                                        <span>Truy cập vào trang quản trị website (WordPress, Shopify, Web tự thiết kế...).</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 rounded-full">2</Badge>
                                                        <span>Tìm đến phần chèn mã <strong>Header/Footer</strong> hoặc thẻ <strong>&lt;body&gt;</strong>.</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 rounded-full">3</Badge>
                                                        <span>Dán đoạn code trên vào vị trí ngay trước thẻ đóng <code>&lt;/body&gt;</code>.</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <Separator />

                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                                    <Info className="h-4 w-4" /> <strong>Lưu ý:</strong> Hiện tại chat widget đang chạy ở môi trường localhost. Để nhúng lên web thật, bạn cần đổi domain <code>localhost:3000</code> thành domain thật của bạn.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </form>
                        </Form>
                    </div>
                </div>
            </Tabs>

            {/* Modal Manual Knowledge */}
            <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Thêm kiến thức thủ công</DialogTitle>
                        <DialogDescription>
                            Nhập trực tiếp thông tin bạn muốn AI ghi nhớ.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tên nguồn (Ví dụ: Quy định đổi trả)</label>
                            <Input
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="Tên để bạn dễ quản lý..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung kiến thức</label>
                            <Textarea
                                value={manualContent}
                                onChange={(e) => setManualContent(e.target.value)}
                                placeholder="Dán hoặc nhập nội dung chi tiết tại đây..."
                                className="min-h-[200px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowManualModal(false)}>Hủy</Button>
                        <Button onClick={handleAddManualKnowledge} disabled={isSavingManual}>
                            {isSavingManual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu kiến thức
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Website Scanning (Basic) */}
            <Dialog open={showWebsiteModal} onOpenChange={setShowWebsiteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quét Website</DialogTitle>
                        <DialogDescription>Nhập URL website để AI tự động thu thập dữ liệu.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tên nguồn (Ví dụ: Giới thiệu chung)</label>
                            <Input
                                value={websiteName}
                                onChange={(e) => setWebsiteName(e.target.value)}
                                placeholder="Tên để bạn dễ quản lý..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL Website</label>
                            <Input
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://example.com/page"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Lưu ý: Chức năng này sẽ quét nội dung văn bản từ trang web bạn cung cấp.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWebsiteModal(false)}>Hủy</Button>
                        <Button onClick={handleAddWebsiteKnowledge} disabled={isSavingWebsite}>
                            {isSavingWebsite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Bắt đầu quét
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal File Upload (Basic) */}
            <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tải File lên</DialogTitle>
                        <DialogDescription>Tải tài liệu PDF, DOCX hoặc TXT.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tên nguồn (Ví dụ: Tài liệu sản phẩm)</label>
                            <Input
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="Tên để bạn dễ quản lý..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chọn tài liệu</label>
                            <div className="py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                {selectedFile ? (
                                    <div className="flex flex-col items-center">
                                        <FileUp className="h-10 w-10 mb-2 text-blue-500" />
                                        <p className="text-sm text-gray-900 font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <Button variant="link" size="sm" onClick={() => setSelectedFile(null)}>Chọn lại</Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FileUp className="h-10 w-10 mb-2" />
                                        <p className="text-sm">Chưa chọn file nào</p>
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                        <Button variant="link" onClick={() => {
                                            const input = document.getElementById('file-upload') as HTMLInputElement;
                                            input?.click();
                                        }}>Chọn file từ máy tính</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFileModal(false)}>Hủy</Button>
                        <Button onClick={handleAddFileKnowledge} disabled={isSavingFile || !selectedFile}>
                            {isSavingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tải lên
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
