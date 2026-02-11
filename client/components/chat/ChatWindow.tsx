"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, UserCheck, ThumbsUp, ThumbsDown, Edit3, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "USER" | "AI" | "AGENT";
    content: string;
    rating?: number | null;
    feedback?: string | null;
    correctedContent?: string | null;
    createdAt: string;
}

interface ChatWindowProps {
    conversationId: string;
    messages: Message[];
    customerName: string;
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
    isAiSuspended?: boolean;
    onToggleAI?: () => void;
}

export function ChatWindow({
    conversationId,
    messages,
    customerName,
    onSendMessage,
    isLoading,
    isAiSuspended,
    onToggleAI
}: ChatWindowProps) {
    const [input, setInput] = useState("");
    const [correctingMessageId, setCorrectingMessageId] = useState<string | null>(null);
    const [correctedContent, setCorrectedContent] = useState("");
    const [submittingCorrection, setSubmittingCorrection] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    const handleFeedback = async (messageId: string, rating: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/conversations/messages/${messageId}/feedback`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ rating })
            });

            if (res.ok) {
                toast.success(rating === 1 ? "Đã thích phản hồi" : "Đã gửi đánh giá chưa tốt");
                // In a real app, we'd update the messages state locally or re-fetch
            }
        } catch (error) {
            toast.error("Không thể gửi đánh giá");
        }
    };

    const handleStartCorrection = (message: Message) => {
        setCorrectingMessageId(message.id);
        setCorrectedContent(message.correctedContent || message.content);
    };

    const handleSubmitCorrection = async () => {
        if (!correctingMessageId) return;
        setSubmittingCorrection(true);
        try {
            const res = await fetch(`http://localhost:5000/api/conversations/messages/${correctingMessageId}/correction`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ correctedContent })
            });

            if (res.ok) {
                toast.success("Đã cập nhật câu trả lời mẫu");
                setCorrectingMessageId(null);
            }
        } catch (error) {
            toast.error("Lỗi khi lưu câu trả lời");
        } finally {
            setSubmittingCorrection(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {customerName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm">{customerName}</h2>
                        <div className="flex items-center gap-1.5">
                            {isAiSuspended ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Chế độ thủ công</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">AI Đang trả lời</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={isAiSuspended ? "default" : "outline"}
                        size="sm"
                        className={cn("h-8 text-xs", isAiSuspended ? "bg-blue-600 hover:bg-blue-700" : "")}
                        onClick={onToggleAI}
                    >
                        {isAiSuspended ? "Chuyển giao cho AI" : "Can thiệp (Tắt AI)"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100">Kết thúc</Button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex max-w-[85%] flex-col",
                            msg.role === "USER" ? "mr-auto items-start" : "ml-auto items-end"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1 px-1">
                            {msg.role === "USER" ? (
                                <>
                                    <User className="h-3 w-3 text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{customerName}</span>
                                </>
                            ) : msg.role === "AI" ? (
                                <>
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">AI Trợ lý</span>
                                    < Bot className="h-3 w-3 text-blue-400" />
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Nhân viên</span>
                                    <UserCheck className="h-3 w-3 text-green-500" />
                                </>
                            )}
                        </div>

                        <div className="relative group flex flex-col items-end">
                            <div
                                className={cn(
                                    "px-4 py-3 rounded-2xl text-sm shadow-sm transition-all",
                                    msg.role === "USER"
                                        ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                        : msg.role === "AI"
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-green-600 text-white rounded-tr-none"
                                )}
                            >
                                {msg.content}
                            </div>

                            {/* AI Training Actions */}
                            {msg.role === "AI" && (
                                <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleFeedback(msg.id, 1)}
                                        className={cn(
                                            "p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600",
                                            msg.rating === 1 && "text-blue-600 bg-blue-50"
                                        )}
                                        title="Hài lòng"
                                    >
                                        <ThumbsUp className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(msg.id, -1)}
                                        className={cn(
                                            "p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500",
                                            msg.rating === -1 && "text-red-500 bg-red-50"
                                        )}
                                        title="Chưa hài lòng"
                                    >
                                        <ThumbsDown className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleStartCorrection(msg)}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors text-gray-400 hover:text-orange-600 text-[10px] font-bold uppercase",
                                            msg.correctedContent && "text-orange-600 bg-orange-50"
                                        )}
                                        title="Dạy lại AI"
                                    >
                                        <Edit3 className="h-3 w-3" /> Chỉnh sửa
                                    </button>
                                </div>
                            )}

                            {/* Correction Form */}
                            {correctingMessageId === msg.id && (
                                <div className="mt-3 w-full bg-white border border-orange-200 rounded-xl p-3 shadow-lg z-10 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-2 flex items-center gap-1">
                                        <Bot className="h-3 w-3" /> Dạy AI trả lời tốt hơn
                                    </p>
                                    <Textarea
                                        className="text-xs min-h-[60px] border-orange-100 focus-visible:ring-orange-400"
                                        value={correctedContent}
                                        onChange={(e) => setCorrectedContent(e.target.value)}
                                        placeholder="Nhập câu trả lời mẫu chuẩn..."
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[10px] font-bold px-2 hover:bg-gray-100"
                                            onClick={() => setCorrectingMessageId(null)}
                                        >
                                            <X className="h-3 w-3 mr-1" /> Hủy
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-7 text-[10px] font-bold px-2 bg-orange-500 hover:bg-orange-600"
                                            onClick={handleSubmitCorrection}
                                            disabled={submittingCorrection}
                                        >
                                            {submittingCorrection ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                                            Lưu câu trả lời
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Display correction if exists (and not currently editing) */}
                            {msg.correctedContent && correctingMessageId !== msg.id && (
                                <div className="mt-2 text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded-lg border border-orange-100 max-w-full">
                                    <span className="font-bold uppercase">Yêu cầu sửa:</span> {msg.correctedContent}
                                </div>
                            )}
                        </div>

                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
                <div className="relative group">
                    <Textarea
                        placeholder="Nhập nội dung tin nhắn..."
                        className="min-h-[80px] pr-12 focus-visible:ring-blue-500 border-gray-200 resize-none rounded-xl"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 bottom-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
                        onClick={handleSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Nhấn <b>Enter</b> để gửi, <b>Shift + Enter</b> để xuống dòng
                </p>
            </div>
        </div>
    );
}
