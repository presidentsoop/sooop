"use client";

import { useState } from "react";
import { Mail, Plus, Send, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateCampaignModal from "./CreateCampaignModal";
import { logAuditAction } from "@/app/actions/audit";

interface CampaignsViewProps {
    initialCampaigns: any[];
    userRole: string; // Passed from layout/page (actually layout handles context, but we use DashboardLayout wrapper?)
    // Wait, Page wraps in DashboardLayout. View is INSIDE Page.
    // So View just needs to render the CONTENT.
    // BUT the current Page renders DashboardLayout.
    // If we move everything to View, View must render DashboardLayout or be wrapped by it.
    // DashboardLayout is Client Comp? Yes.
    // Let's keep DashboardLayout in Page, and pass campaigns to View.
}

// Actually, View should just be the Inner Content.
export default function CampaignsView({ initialCampaigns }: { initialCampaigns: any[] }) {
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleCreated = () => {
        router.refresh();
        // Optimistic update or refetch?
        // Let's refetch client side or just wait for router refresh.
        // For better UX, let's mix.
        // We'll trust router.refresh() but also maybe fetch fresh to be instant.
        refreshData();
    };

    const refreshData = async () => {
        const { data } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
        if (data) setCampaigns(data);
    };

    const handleSend = async (campaign: any) => {
        if (!confirm(`Are you sure you want to send "${campaign.subject}" to ${campaign.recipient_filter} members?`)) return;

        setSendingId(campaign.id);
        try {
            // 1. Update Status
            const { error } = await supabase
                .from('email_campaigns')
                .update({ status: 'sending', sent_at: new Date().toISOString() })
                .eq('id', campaign.id);

            if (error) throw error;

            // 2. Log Audit
            await logAuditAction("send_campaign", { campaign_id: campaign.id, subject: campaign.subject });

            // 3. Mock Sending Process (Time delay simulation)
            setTimeout(async () => {
                await supabase
                    .from('email_campaigns')
                    .update({ status: 'sent', sent_count: Math.floor(Math.random() * 500) + 100 }) // Mock count
                    .eq('id', campaign.id);
                refreshData();
                toast.success("Campaign sent successfully!");
            }, 2000);

            toast.info("Campaign queued for sending...");
            refreshData();

        } catch (error) {
            toast.error("Failed to send campaign");
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                    <p className="text-gray-500 mt-2">Manage newsletters and promotional emails.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Create Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Card - Quick Action */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-primary/50 hover:shadow-md transition gap-4 group cursor-pointer h-64"
                >
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-bold text-gray-500 group-hover:text-primary transition">Draft New Email</p>
                </div>

                {/* Campaign Cards */}
                {campaigns?.map((campaign: any) => (
                    <div key={campaign.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-64 relative overflow-hidden">
                        {sendingId === campaign.id && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                }`}>
                                {campaign.status}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(campaign.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2" title={campaign.subject}>{campaign.subject}</h3>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{campaign.body}</p>

                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
                            <span className="text-gray-500">Recipients: <span className="font-bold text-gray-900">{campaign.recipient_filter === 'all' ? 'All Members' : 'Custom'}</span></span>
                            {campaign.status === 'draft' && (
                                <button
                                    onClick={() => handleSend(campaign)}
                                    className="text-primary font-bold flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform"
                                >
                                    Continue <Send className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {(!campaigns || campaigns.length === 0) && (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-12 text-gray-400">
                        <p>No past campaigns.</p>
                    </div>
                )}
            </div>

            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={handleCreated}
            />
        </div>
    );
}
