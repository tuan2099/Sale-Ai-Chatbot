"use client";

import { useEffect, useState, useRef } from "react";
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
    widgetSuggestions: string;
    widgetWelcomeSuggestions: string;
    widgetFont: string;
}

export default function WidgetPage() {
    const params = useParams();
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Use both state (for UI/Polling) and Ref (for handleSend and effects to avoid stale closures)
    const [messages, _setMessages] = useState<{ role: "AI" | "USER" | "AGENT"; content: string }[]>([]);
    const messagesRef = useRef<{ role: "AI" | "USER" | "AGENT"; content: string }[]>([]);

    const setMessages = (newMessages: { role: "AI" | "USER" | "AGENT"; content: string }[] | ((prev: { role: "AI" | "USER" | "AGENT"; content: string }[]) => { role: "AI" | "USER" | "AGENT"; content: string }[])) => {
        if (typeof newMessages === 'function') {
            const result = newMessages(messagesRef.current);
            _setMessages(result);
            messagesRef.current = result;
        } else {
            _setMessages(newMessages);
            messagesRef.current = newMessages;
        }
    };

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);

    // Conversation ID Tracking (State + Ref + Sync Helper)
    const [conversationId, _setConversationId] = useState<string | null>(null);
    const convIdRef = useRef<string | null>(null);

    const setConversationId = (id: string | null) => {
        console.log("[WIDGET] setConversationId called with:", id);
        _setConversationId(id);
        convIdRef.current = id;
        if (id) {
            localStorage.setItem(`conv_${params.id}`, id);
        } else {
            localStorage.removeItem(`conv_${params.id}`);
        }
    };

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

    // Polling for new messages from Server
    useEffect(() => {
        let interval: any;
        // Depend ONLY on identity shifts (conv ID or window open state)
        if (conversationId && isOpen) {
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/chat/public/messages/${conversationId}`);
                    if (res.ok) {
                        const serverData = await res.json();

                        const serverMessages = serverData.map((m: any) => ({
                            role: m.role,
                            content: m.content
                        }));

                        const welcomeMsg = config?.widgetWelcomeMsg || "Chào bạn! Tôi có thể giúp gì cho bạn?";
                        const hasWelcomeOnServer = serverMessages.length > 0 && serverMessages[0].content === welcomeMsg;

                        const mergedMessages = hasWelcomeOnServer
                            ? serverMessages
                            : [{ role: "AI", content: welcomeMsg }, ...serverMessages];

                        // Only sync if the length or content is actually different from our latest REF
                        if (JSON.stringify(mergedMessages) !== JSON.stringify(messagesRef.current)) {
                            console.log("[WIDGET] Polling Sync: updating messages.");
                            setMessages(mergedMessages);
                        }
                    }
                } catch (error) {
                    console.error("Poll error:", error);
                }
            };

            fetchHistory();
            interval = setInterval(fetchHistory, 3000);
        }
        return () => clearInterval(interval);
    }, [conversationId, isOpen, config?.widgetWelcomeMsg]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/stores/public/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setConfig(data);

                    if (data.widgetSuggestions) {
                        const allSuggestions = data.widgetSuggestions.split("\n")
                            .map((s: string) => s.trim())
                            .filter((s: string) => s.length > 0);
                        setRandomizedSuggestions(allSuggestions.sort(() => Math.random() - 0.5).slice(0, 3));
                    }

                    // RESTORE: Pull from storage on mount
                    const savedMessages = localStorage.getItem(`chat_${params.id}`);
                    const savedConvId = localStorage.getItem(`conv_${params.id}`);

                    if (savedConvId) {
                        console.log("[WIDGET] Found saved conversationId:", savedConvId);
                        setConversationId(savedConvId);
                    }

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
        // Persistence sync
        if (messagesRef.current.length > 0) {
            localStorage.setItem(`chat_${params.id}`, JSON.stringify(messagesRef.current));
        }
    }, [messages, params.id]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (msgContent?: string) => {
        const textToSend = msgContent || input;
        if (!textToSend.trim()) return;

        // CRITICAL: Pull latest ID from Ref or Storage to avoid closures
        const currentId = convIdRef.current || localStorage.getItem(`conv_${params.id}`);
        console.log("[WIDGET] handleSend starting. currentId:", currentId);

        setMessages(prev => [...prev, { role: "USER", content: textToSend }]);
        if (!msgContent) setInput("");
        setIsTyping(true);

        try {
            console.log("[WIDGET] POST with conversationId:", currentId);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const res = await fetch(`http://localhost:5000/api/chat/public/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: textToSend,
                    history: messagesRef.current.slice(0, -1), // Use the ref to get the history correctly sans current message
                    conversationId: currentId
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                console.log("[WIDGET] POST Success. Received ID:", data.conversationId);

                setMessages(prev => [...prev, { role: "AI", content: data.content }]);
                if (data.conversationId) {
                    setConversationId(data.conversationId);
                }
            } else {
                console.error("[WIDGET] POST Error:", res.status);
                setMessages(prev => [...prev, { role: "AI", content: "Xin lỗi, đã có lỗi kết nối. Hãy thử lại sau nhé!" }]);
            }
        } catch (error: any) {
            console.error("[WIDGET] Chat Error Exception:", error);
            if (error.name === 'AbortError') {
                setMessages(prev => [...prev, { role: "AI", content: "Phản hồi quá lâu, vui lòng thử lại sau." }]);
            } else {
                setMessages(prev => [...prev, { role: "AI", content: "Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối." }]);
            }
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

    // Lead Form State
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadFormData, setLeadFormData] = useState({ name: "", email: "", phoneNumber: "", address: "", note: "" });
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);

    useEffect(() => {
        if (!isOpen || !config) return;

        // Check if lead form is required and not yet submitted
        const leadFields = config.widgetLeadFields ? config.widgetLeadFields.split(",").filter(f => f) : [];
        const hasSubmittedLead = localStorage.getItem(`lead_submitted_${params.id}`);
        const hasConversation = localStorage.getItem(`conv_${params.id}`);

        // Only show if fields are configured AND (not submitted OR no conversation yet)
        if (leadFields.length > 0 && !hasSubmittedLead && !hasConversation) {
            setShowLeadForm(true);
        }
    }, [isOpen, config, params.id]);

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingLead(true);

        try {
            const res = await fetch(`http://localhost:5000/api/chat/public/lead/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leadFormData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Lead submitted:", data);

                localStorage.setItem(`lead_submitted_${params.id}`, "true");

                if (data.customerId) {
                    // Start conversation immediately
                    if (data.conversationId) {
                        setConversationId(data.conversationId);
                    }
                    setShowLeadForm(false);

                    // Optionally send a welcome message from user side to trigger flow?
                    // Or just let them start chatting. 
                    // Let's add a system message locally saying "Info received"
                    setMessages(prev => [...prev, { role: "AI", content: "Cảm ơn bạn! Tôi đã nhận được thông tin. Tôi có thể giúp gì cho bạn?" }]);
                }
            } else {
                console.error("Lead submit failed"); // Handle error UI if needed
            }
        } catch (error) {
            console.error("Lead submit error", error);
        } finally {
            setIsSubmittingLead(false);
        }
    };

    if (loading) return null;
    if (!config) return <div className="text-gray-400 p-4 text-xs">Widget not available</div>;

    const welcomeSuggestions = config.widgetWelcomeSuggestions
        ? config.widgetWelcomeSuggestions.split("\n")
            .map(s => s.trim())
            .filter(s => s.length > 0)
        : [];

    const leadFields = config.widgetLeadFields ? config.widgetLeadFields.split(",") : [];

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
                                        setConversationId(null);
                                        localStorage.removeItem(`chat_${params.id}`);
                                        localStorage.removeItem(`conv_${params.id}`);
                                        localStorage.removeItem(`lead_submitted_${params.id}`); // Reset lead submission too
                                        setShowLeadForm(true); // Re-show form if configured
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

                    {/* BODY CONTENT - CONDITIONAL RENDER */}
                    {showLeadForm ? (
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col justify-center">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">Xin chào! 👋</h3>
                                <p className="text-xs text-gray-500 mb-4">Vui lòng để lại thông tin để chúng tôi hỗ trợ tốt nhất nhé.</p>

                                <form onSubmit={handleSubmitLead} className="space-y-3">
                                    {leadFields.includes("name") && (
                                        <input
                                            required
                                            type="text"
                                            placeholder="Tên của bạn *"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={leadFormData.name}
                                            onChange={e => setLeadFormData({ ...leadFormData, name: e.target.value })}
                                        />
                                    )}
                                    {leadFields.includes("phoneNumber") && (
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Số điện thoại *"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={leadFormData.phoneNumber}
                                            onChange={e => setLeadFormData({ ...leadFormData, phoneNumber: e.target.value })}
                                        />
                                    )}
                                    {leadFields.includes("email") && (
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={leadFormData.email}
                                            onChange={e => setLeadFormData({ ...leadFormData, email: e.target.value })}
                                        />
                                    )}
                                    {leadFields.includes("address") && (
                                        <input
                                            type="text"
                                            placeholder="Địa chỉ"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={leadFormData.address}
                                            onChange={e => setLeadFormData({ ...leadFormData, address: e.target.value })}
                                        />
                                    )}
                                    {leadFields.includes("note") && (
                                        <textarea
                                            placeholder="Ghi chú thêm..."
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20"
                                            value={leadFormData.note}
                                            onChange={e => setLeadFormData({ ...leadFormData, note: e.target.value })}
                                        />
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmittingLead}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-70 mt-2"
                                        style={{ backgroundColor: config.widgetColor }}
                                    >
                                        {isSubmittingLead ? "Đang gửi..." : "Bắt đầu Chat"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowLeadForm(false)}
                                        className="w-full py-2 text-gray-400 text-xs hover:text-gray-600"
                                    >
                                        Bỏ qua và chat ngay
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* Normal Chat Body */
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
                                        "p-3 rounded-2xl text-sm shadow-sm relative group",
                                        m.role === "USER" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                    )}
                                        style={m.role === "USER" ? { backgroundColor: config.widgetColor } : {}}
                                    >
                                        {m.role === 'AGENT' && (
                                            <div className="text-[9px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                                Nhân viên hỗ trợ
                                            </div>
                                        )}
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {messages.length === 1 && messages[0].role === "AI" && randomizedSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 ml-10">
                                    {randomizedSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="text-[11px] px-3 py-1.5 bg-white border-blue-100 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm text-left border"
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
                    )}

                    {/* Footer - Hide input when showing lead form */}
                    {!showLeadForm && (
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
                                Cung cấp bởi <span className="font-bold text-blue-600 opacity-70">AI AGENT PLATFORM</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Welcome Bubbles next to Button */}
            {!isOpen && welcomeSuggestions.length > 0 && (
                <div className="flex flex-col items-end gap-2 mb-4 animate-in fade-in slide-in-from-right-5 duration-700 delay-300">
                    {welcomeSuggestions.slice(0, 2).map((s, i) => (
                        <div
                            key={i}
                            onClick={() => { setIsOpen(true); handleSend(s); }}
                            className="bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg border border-gray-100 text-xs font-medium text-gray-800 cursor-pointer hover:bg-gray-50 transition-all hover:-translate-x-1"
                        >
                            {s}
                        </div>
                    ))}
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
