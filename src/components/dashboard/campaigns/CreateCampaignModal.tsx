"use client";

import { useState } from "react";
import { X, Send, Users, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { logAuditAction } from "@/app/actions/audit";

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, onCreated }: CreateCampaignModalProps) {
    const [formData, setFormData] = useState({
        subject: "",
        body: "",
        recipient_filter: "all"
    });
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Campaign
            const { data, error } = await supabase.from('email_campaigns').insert({
                subject: formData.subject,
                body: formData.body,
                recipient_filter: formData.recipient_filter,
                status: 'draft',
                created_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;

            // 2. Log Action
            await logAuditAction("create_campaign", {
                campaign_id: data.id,
                subject: data.subject
            });

            toast.success("Campaign draft created");
            onCreated();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">Create Email Campaign</h3>
                        <p className="text-xs text-gray-500">Draft a new message to your members.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Subject */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Subject</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                className="w-full pl-10 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-gray-900"
                                placeholder="e.g. Important Announcement regarding Membership"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Recipients */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Recipients</label>
                        <div className="flex items-center gap-4">
                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.recipient_filter === 'all' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="recipient_filter"
                                    className="hidden"
                                    checked={formData.recipient_filter === 'all'}
                                    onChange={() => setFormData({ ...formData, recipient_filter: 'all' })}
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.recipient_filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${formData.recipient_filter === 'all' ? 'text-primary' : 'text-gray-700'}`}>All Members</p>
                                        <p className="text-xs text-gray-500">Send to everyone</p>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.recipient_filter === 'custom' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="recipient_filter"
                                    className="hidden"
                                    checked={formData.recipient_filter === 'custom'}
                                    onChange={() => setFormData({ ...formData, recipient_filter: 'custom' })}
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.recipient_filter === 'custom' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users className="w-5 h-5 block opacity-50" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${formData.recipient_filter === 'custom' ? 'text-primary' : 'text-gray-700'}`}>Custom Segment</p>
                                        <p className="text-xs text-gray-500">Coming Soon</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Body */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message Body</label>
                        <textarea
                            className="w-full h-40 bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm leading-relaxed"
                            placeholder="Write your message here..."
                            value={formData.body}
                            onChange={e => setFormData({ ...formData, body: e.target.value })}
                            required
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">Markdown supported</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-bold text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                        {loading ? 'Creating...' : 'Save Draft'}
                    </button>
                </form>
            </div>
        </div>
    );
}
