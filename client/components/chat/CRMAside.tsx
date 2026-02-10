"use client";

import { useState } from "react";
import { User, Phone, Mail, Tag, Plus, MessageSquare, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Note {
    id: string;
    content: string;
    user: { name: string };
    createdAt: string;
}

interface TagItem {
    id: string;
    name: string;
    color: string;
}

interface CRMAsideProps {
    customer: {
        id: string;
        name: string;
        email?: string;
        phoneNumber?: string;
        channel: string;
    };
    notes: Note[];
    tags: TagItem[];
    allTags: TagItem[];
    onAddNote: (content: string) => void;
    onAddTag: (tagId: string) => void;
    onRemoveTag: (tagId: string) => void;
}

export function CRMAside({
    customer,
    notes,
    tags,
    allTags,
    onAddNote,
    onAddTag,
    onRemoveTag
}: CRMAsideProps) {
    const [noteInput, setNoteInput] = useState("");

    return (
        <div className="w-80 h-full bg-white border-l overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-8">
                {/* Customer Info */}
                <div className="text-center space-y-3">
                    <div className="h-20 w-20 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center border-4 border-gray-50 shadow-inner">
                        <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{customer.name}</h3>
                        <Badge variant="secondary" className="mt-1 font-normal opacity-70 uppercase tracking-tighter text-[10px]">
                            {customer.channel}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{customer.email || "Chưa có email"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{customer.phoneNumber || "Chưa có SĐT"}</span>
                    </div>
                </div>

                <Separator />

                {/* Tags Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Tag className="h-3 w-3" /> Nhãn & Phân loại
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <Badge
                                key={tag.id}
                                style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" }}
                                className="group pl-2 pr-1.5 py-0.5 border"
                            >
                                {tag.name}
                                <X
                                    className="ml-1.5 h-3 w-3 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onRemoveTag(tag.id)}
                                />
                            </Badge>
                        ))}
                        <div className="relative">
                            <select
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => onAddTag(e.target.value)}
                                value=""
                            >
                                <option value="" disabled>Thêm...</option>
                                {allTags.filter(t => !tags.find(ct => ct.id === t.id)).map(tag => (
                                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                                ))}
                            </select>
                            <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] border-dashed">
                                <Plus className="h-3 w-3 mr-1" /> Thêm thẻ
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Notes Section */}
                <div className="space-y-4 pb-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <StickyNote className="h-3 w-3" /> Ghi chú nội bộ
                    </h4>

                    <div className="space-y-2">
                        <Textarea
                            placeholder="Nhập ghi chú quan trọng về khách..."
                            className="min-h-[80px] text-xs bg-yellow-50/30 border-yellow-100 focus-visible:ring-yellow-500"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                        />
                        <Button
                            className="w-full h-8 text-xs bg-gray-900 hover:bg-black"
                            onClick={() => {
                                if (noteInput.trim()) {
                                    onAddNote(noteInput);
                                    setNoteInput("");
                                }
                            }}
                        >
                            Lưu ghi chú
                        </Button>
                    </div>

                    <div className="space-y-3 pt-2">
                        {notes.map(note => (
                            <div key={note.id} className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                <p className="text-xs text-gray-700 leading-relaxed italic">"{note.content}"</p>
                                <div className="flex justify-between items-center opacity-50">
                                    <span className="text-[9px] font-bold">{note.user.name}</span>
                                    <span className="text-[9px]">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
