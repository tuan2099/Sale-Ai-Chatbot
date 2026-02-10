"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Send, X, Bot, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreConfig {
    id: string;
    name: string;
    aiName: string;
    widgetColor: string;
    widgetImage: string;
    widgetWelcomeMsg: string;
    widgetWelcomeSuggestions: string;
    widgetFont: string;
}

export default function WidgetPage() {
    const params = useParams();
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "AI" | "USER"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Dynamic Font Loading
        if (config?.widgetFont && config.widgetFont !== "Inter") {
            const fontName = config.widgetFont.replace(/\s+/g, '+');
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            return () => {
                document.head.removeChild(link);
            };
        }
    }, [config?.widgetFont]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/stores/public/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setConfig(data);

                    // Load from localStorage or set default
                    const savedMessages = localStorage.getItem(`chat_${params.id}`);
                    if (savedMessages) {
                        setMessages(JSON.parse(savedMessages));
                    } else {
                        setMessages([{ role: "AI", content: data.widgetWelcomeMsg || "Chào bạn! Tôi có thể giúp gì cho bạn?" }]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch widget config", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchConfig();
    }, [params.id]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
        }
    }, [messages, params.id]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (msgContent?: string) => {
        const textToSend = msgContent || input;
        if (!textToSend.trim()) return;

        setMessages(prev => [...prev, { role: "USER", content: textToSend }]);
        if (!msgContent) setInput("");
        setIsTyping(true);

        try {
            const res = await fetch(`http://localhost:5000/api/chat/public/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: textToSend,
                    history: messages
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: "AI", content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: "AI", content: "Xin lỗi, tôi đang gặp chút sự cố kết nối. Hãy thử lại sau nhé!" }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "AI", content: "Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            window.parent.postMessage('CHAT_OPEN', '*');
        } else {
            window.parent.postMessage('CHAT_CLOSE', '*');
        }
    }, [isOpen]);

    if (loading) return null;
    if (!config) return <div className="text-gray-400 p-4 text-xs">Widget not available</div>;

    const suggestions = config.widgetWelcomeSuggestions ? config.widgetWelcomeSuggestions.split("\n").filter(s => s.trim()) : [];

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end"
            style={{ fontFamily: config.widgetFont || "Inter, sans-serif" }}
        >
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div
                        className="p-4 text-white flex items-center justify-between"
                        style={{ backgroundColor: config.widgetColor || "#2563eb" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white/20">
                                {config.widgetImage ? (
                                    <img src={config.widgetImage} alt="AI" className="w-full h-full object-cover" />
                                ) : (
                                    <Bot className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">{config.aiName || "Assistant"}</h3>
                                <p className="text-[10px] opacity-80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Trực tuyến
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (confirm("Xóa lịch sử chat?")) {
                                        setMessages([{ role: "AI", content: config.widgetWelcomeMsg || "Chào bạn! Tôi có thể giúp gì cho bạn?" }]);
                                        localStorage.removeItem(`chat_${params.id}`);
                                    }
                                }}
                                className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                                title="Xóa lịch sử chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-2 max-w-[85%]", m.role === "USER" ? "ml-auto flex-row-reverse" : "")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    m.role === "AI" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                )}>
                                    {m.role === "AI" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    m.role === "AI" ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-blue-600 text-white rounded-tr-none"
                                )}
                                    style={m.role === "USER" ? { backgroundColor: config.widgetColor } : {}}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {messages.length === 1 && messages[0].role === "AI" && config.widgetWelcomeSuggestions && (
                            <div className="flex flex-wrap gap-2 ml-10">
                                {config.widgetWelcomeSuggestions.split(',').map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s.trim())}
                                        className="text-[11px] px-3 py-1.5 bg-white border border-blue-100 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        {s.trim()}
                                    </button>
                                ))}
                            </div>
                        )}

                        {messages.length === 1 && suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setInput(s); handleSend(); }}
                                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isTyping && (
                            <div className="flex gap-2 mb-4 justify-start">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 overflow-hidden shadow-sm animate-pulse">
                                    {config.widgetImage ? (
                                        <img src={config.widgetImage} alt="AI" className="w-full h-full object-cover" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="p-3 rounded-lg bg-gray-100 text-gray-500 text-xs italic flex items-center gap-2">
                                    <span className="flex gap-1">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </span>
                                    {config.aiName || "Assistant"} đang trả lời...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-white border-t">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all border-none"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button
                                onClick={() => handleSend()}
                                className="absolute right-1 p-2 rounded-full text-white bg-blue-600 hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: config.widgetColor }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
                            Cung cấp bởi <span className="font-bold text-blue-600 opacity-70">Sale Chatbot AI</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden"
                style={{ backgroundColor: config.widgetColor || "#2563eb" }}
            >
                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : config.widgetImage ? (
                    <img src={config.widgetImage} alt="Chat" className="w-full h-full object-cover" />
                ) : (
                    <MessageSquare className="w-7 h-7" />
                )}
            </button>
        </div>
    );
}
