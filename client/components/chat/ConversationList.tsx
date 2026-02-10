"use client";

import { useState } from "react";
import { Search, Filter, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Conversation {
    id: string;
    status: string;
    lastMessage?: string;
    updatedAt: string;
    customer: {
        name: string;
        email?: string;
        image?: string;
    };
    tags: any[];
}

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
}

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    searchTerm,
    onSearchChange
}: ConversationListProps) {
    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b space-y-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm khách hàng..."
                        className="pl-9 bg-gray-50 border-none"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <Badge variant="secondary" className="cursor-pointer whitespace-nowrap">Tất cả</Badge>
                    <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Đang mở</Badge>
                    <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Đã đóng</Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Không tìm thấy hội thoại nào
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "p-4 border-b cursor-pointer transition-colors hover:bg-gray-50",
                                selectedId === conv.id ? "bg-blue-50/50 border-r-2 border-r-blue-600" : ""
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    {conv.customer.image ? (
                                        <img src={conv.customer.image} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-semibold text-sm truncate">{conv.customer.name}</h3>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conv.lastMessage || "Chưa có tin nhắn"}
                                    </p>
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {conv.tags.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                                title={tag.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
