"use client";

import { useState, useEffect, useMemo } from "react";
import { Award, Plus, Send, RefreshCw, Calendar, Users, CheckCircle, XCircle, Clock, Search, X, Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Modal, { Button } from "@/components/ui/Modal";
import { logAuditAction } from "@/app/actions/audit";

interface Certificate {
    id: string;
    title: string;
    description: string;
    meeting_date: string;
    template_url: string;
    status: string;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
}

interface Member {
    id: string;
    full_name: string;
    email: string;
    membership_type?: string;
    city?: string;
    membership_status: string;
    registration_number?: string;
}

interface CertificatesViewProps {
    initialCertificates: Certificate[];
    allMembers: Member[];
}

export default function CertificatesView({ initialCertificates, allMembers }: CertificatesViewProps) {
    const [certificates, setCertificates] = useState(initialCertificates);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 });

    const router = useRouter();
    const supabase = createClient();

    // ═══ CREATE FORM STATE ═══
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meeting_date: '',
    });
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [memberSearch, setMemberSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [creating, setCreating] = useState(false);

    // History management
    useEffect(() => {
        if (isCreateOpen || isSendOpen) {
            window.history.pushState({ modal: 'cert-modal' }, '');
            const handlePopState = () => {
                setIsCreateOpen(false);
                setIsSendOpen(false);
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [isCreateOpen, isSendOpen]);

    const closeModal = () => {
        if (window.history.state?.modal === 'cert-modal') {
            window.history.back();
        } else {
            setIsCreateOpen(false);
            setIsSendOpen(false);
        }
    };

    // ═══ FILTERED MEMBERS ═══
    const filteredMembers = useMemo(() => {
        return allMembers.filter(m => {
            const matchesSearch = !memberSearch ||
                m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                (m.registration_number && m.registration_number.toLowerCase().includes(memberSearch.toLowerCase()));

            const matchesType = typeFilter === 'all' || m.membership_type?.toLowerCase() === typeFilter.toLowerCase();

            return matchesSearch && matchesType;
        });
    }, [allMembers, memberSearch, typeFilter]);

    // ═══ MEMBER TYPES FOR FILTER ═══
    const memberTypes = useMemo(() => {
        const types = new Set(allMembers.map(m => m.membership_type || 'Standard'));
        return Array.from(types);
    }, [allMembers]);

    // ═══ TOGGLE MEMBER SELECTION ═══
    const toggleMember = (id: string) => {
        setSelectedMembers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllFiltered = () => {
        setSelectedMembers(prev => {
            const next = new Set(prev);
            filteredMembers.forEach(m => next.add(m.id));
            return next;
        });
    };

    const deselectAll = () => setSelectedMembers(new Set());

    // ═══ CREATE CERTIFICATE ═══
    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.meeting_date) {
            toast.error("Please fill in the title and meeting date");
            return;
        }
        if (selectedMembers.size === 0) {
            toast.error("Please select at least one member");
            return;
        }

        setCreating(true);

        try {
            // Upload template if provided
            let templateUrl = null;
            if (templateFile) {
                const fileName = `templates/${Date.now()}-${templateFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('certificates')
                    .upload(fileName, templateFile);

                if (uploadError) {
                    // Try to create the bucket if it doesn't exist
                    console.warn('Upload error, bucket may not exist:', uploadError.message);
                } else {
                    templateUrl = fileName;
                }
            }

            // Create certificate record
            const { data: cert, error: certError } = await supabase
                .from('meeting_certificates')
                .insert({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    meeting_date: formData.meeting_date,
                    template_url: templateUrl,
                    total_recipients: selectedMembers.size,
                    status: 'draft',
                })
                .select()
                .single();

            if (certError) throw certError;

            // Create recipient records
            const selectedMembersList = allMembers.filter(m => selectedMembers.has(m.id));
            const recipientRecords = selectedMembersList.map(m => ({
                certificate_id: cert.id,
                user_id: m.id,
                email: m.email,
                full_name: m.full_name,
                status: 'pending' as const,
            }));

            const { error: recipError } = await supabase
                .from('certificate_recipients')
                .insert(recipientRecords);

            if (recipError) throw recipError;

            await logAuditAction('CERTIFICATE_CREATED', {
                certificate_id: cert.id,
                title: formData.title,
                recipients: selectedMembers.size
            });

            toast.success(`Certificate created with ${selectedMembers.size} recipients!`);

            // Reset form
            setFormData({ title: '', description: '', meeting_date: '' });
            setTemplateFile(null);
            setSelectedMembers(new Set());
            setMemberSearch('');
            closeModal();

            // Refresh
            router.refresh();
            refreshData();

        } catch (error: any) {
            console.error('Create error:', error);
            toast.error("Failed to create certificate: " + error.message);
        } finally {
            setCreating(false);
        }
    };

    // ═══ SEND CERTIFICATES ═══
    const handleSend = async (cert: Certificate) => {
        setSelectedCert(cert);
        setIsSendOpen(true);
    };

    const confirmSend = async () => {
        if (!selectedCert) return;

        setSending(true);
        setSendProgress({ sent: 0, failed: 0, total: selectedCert.total_recipients });

        try {
            // Update status to sending
            await supabase
                .from('meeting_certificates')
                .update({ status: 'sending' })
                .eq('id', selectedCert.id);

            // Fetch all pending recipients
            const { data: recipients } = await supabase
                .from('certificate_recipients')
                .select('id')
                .eq('certificate_id', selectedCert.id)
                .eq('status', 'pending');

            if (!recipients?.length) {
                toast.info("No pending recipients to send to");
                setSending(false);
                return;
            }

            const BATCH_SIZE = 5;
            let totalSent = 0;
            let totalFailed = 0;

            // Split into batches
            for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
                const batch = recipients.slice(i, i + BATCH_SIZE);
                const batchIds = batch.map(r => r.id);

                try {
                    const res = await fetch('/api/send-certificates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            certificateId: selectedCert.id,
                            recipientIds: batchIds,
                        }),
                    });

                    const result = await res.json();

                    if (result.success) {
                        totalSent += result.sent;
                        totalFailed += result.failed;
                    } else {
                        totalFailed += batch.length;
                    }
                } catch (error) {
                    totalFailed += batch.length;
                }

                setSendProgress({ sent: totalSent, failed: totalFailed, total: recipients.length });
            }

            // Update final status
            await supabase
                .from('meeting_certificates')
                .update({
                    status: 'sent',
                    sent_count: totalSent,
                    failed_count: totalFailed,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedCert.id);

            await logAuditAction('CERTIFICATES_SENT', {
                certificate_id: selectedCert.id,
                title: selectedCert.title,
                sent: totalSent,
                failed: totalFailed
            });

            if (totalFailed === 0) {
                toast.success(`All ${totalSent} certificates sent successfully! 🎉`);
            } else {
                toast.warning(`Sent: ${totalSent}, Failed: ${totalFailed}`);
            }

            refreshData();

        } catch (error) {
            toast.error("Failed to send certificates");
        } finally {
            setSending(false);
            setIsSendOpen(false);
            setSelectedCert(null);
        }
    };

    const refreshData = async () => {
        const { data } = await supabase
            .from('meeting_certificates')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setCertificates(data);
    };

    // ═══ DELETE ═══
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certificate and all recipients?')) return;

        const { error } = await supabase
            .from('meeting_certificates')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete');
        } else {
            toast.success('Certificate deleted');
            refreshData();
        }
    };

    // ═══ STATUS BADGE ═══
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
        sending: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Loader2 },
        sent: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meeting Certificates</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Create and send participation certificates for meetings & events.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="btn btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" /> New Certificate
                </button>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Quick Create Card */}
                <div
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-primary/50 hover:shadow-md transition gap-4 group cursor-pointer min-h-[220px]"
                >
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                        <Award className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-bold text-gray-500 group-hover:text-primary transition text-center">Create New Certificate</p>
                </div>

                {/* Certificate Cards */}
                {certificates.map(cert => {
                    const config = statusConfig[cert.status] || statusConfig.draft;
                    const StatusIcon = config.icon;

                    return (
                        <div key={cert.id} className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-[220px] relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${cert.status === 'sending' ? 'animate-spin' : ''}`} />
                                    {cert.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(cert.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{cert.title}</h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(cert.meeting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>

                            {cert.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{cert.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-gray-600">
                                        <Users className="w-4 h-4" /> {cert.total_recipients}
                                    </span>
                                    {cert.sent_count > 0 && (
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <CheckCircle className="w-3.5 h-3.5" /> {cert.sent_count}
                                        </span>
                                    )}
                                    {cert.failed_count > 0 && (
                                        <span className="flex items-center gap-1 text-red-600">
                                            <XCircle className="w-3.5 h-3.5" /> {cert.failed_count}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {cert.status === 'draft' && (
                                        <button
                                            onClick={() => handleSend(cert)}
                                            className="text-primary font-bold flex items-center gap-1 hover:underline text-xs sm:text-sm"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Send
                                        </button>
                                    )}
                                    {cert.status === 'sent' && cert.failed_count > 0 && (
                                        <button
                                            onClick={() => handleSend(cert)}
                                            className="text-amber-600 font-bold flex items-center gap-1 hover:underline text-xs sm:text-sm"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Retry Failed
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors ml-2"
                                        title="Delete"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {certificates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400">
                        <Award className="w-12 h-12 mb-3 opacity-30" />
                        <p>No certificates created yet.</p>
                    </div>
                )}
            </div>

            {/* ═══ CREATE CERTIFICATE MODAL ═══ */}
            <Modal
                isOpen={isCreateOpen}
                onClose={closeModal}
                title="Create Meeting Certificate"
                subtitle="Set up a new participation certificate and select recipients"
                size="xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            loading={creating}
                            icon={<Award className="w-4 h-4" />}
                        >
                            Create Certificate ({selectedMembers.size} recipients)
                        </Button>
                    </>
                }
            >
                <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Event Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Event Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting/Event Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="e.g. Annual General Meeting 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date *</label>
                                <input
                                    type="date"
                                    value={formData.meeting_date}
                                    onChange={e => setFormData({ ...formData, meeting_date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Template (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setTemplateFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    rows={2}
                                    placeholder="Brief description of the event..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Select Recipients
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    {selectedMembers.size} selected
                                </span>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={e => setMemberSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Search by name, email, reg number..."
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="all">All Types</option>
                                {memberTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={selectAllFiltered}
                                className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                Select All Filtered ({filteredMembers.length})
                            </button>
                            {selectedMembers.size > 0 && (
                                <button
                                    onClick={deselectAll}
                                    className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>

                        {/* Members List */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                            {filteredMembers.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No members found matching your search.
                                </div>
                            ) : (
                                filteredMembers.map(member => {
                                    const isSelected = selectedMembers.has(member.id);
                                    return (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleMember(member.id)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                ? 'bg-primary border-primary'
                                                : 'border-gray-300'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{member.full_name}</p>
                                                    {member.registration_number && (
                                                        <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                                            #{member.registration_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0 hidden sm:inline">
                                                {member.membership_type || 'Standard'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ═══ SEND CONFIRMATION MODAL ═══ */}
            <Modal
                isOpen={isSendOpen}
                onClose={() => !sending && closeModal()}
                title={sending ? "Sending Certificates..." : "Send Certificates"}
                subtitle={selectedCert?.title}
                size="md"
                footer={!sending ? (
                    <>
                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={confirmSend}
                            icon={<Send className="w-4 h-4" />}
                        >
                            Send to {selectedCert?.total_recipients} Members
                        </Button>
                    </>
                ) : undefined}
            >
                <div className="p-6">
                    {!sending ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <p className="text-sm text-blue-800 font-medium">
                                    You are about to send participation certificates to <strong>{selectedCert?.total_recipients} members</strong>.
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Each member will receive a personalized PDF certificate via email.
                                </p>
                            </div>

                            {selectedCert?.failed_count ? (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {selectedCert.failed_count} previously failed — only those will be retried.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Progress */}
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Sending in progress...</h3>
                                <p className="text-gray-500 mt-1 text-sm">Please don't close this window</p>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-bold text-gray-900">
                                        {sendProgress.sent + sendProgress.failed} / {sendProgress.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent-500 transition-all duration-500"
                                        style={{ width: `${((sendProgress.sent + sendProgress.failed) / Math.max(sendProgress.total, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{sendProgress.sent}</p>
                                    <p className="text-xs text-emerald-700 font-medium">Sent</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-red-600">{sendProgress.failed}</p>
                                    <p className="text-xs text-red-700 font-medium">Failed</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
