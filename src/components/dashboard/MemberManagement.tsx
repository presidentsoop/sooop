"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserPlus, Upload, Clock, Check, X, Ban, RefreshCw, Settings, Eye, FileText, CreditCard, MoreHorizontal, ChevronDown, Users, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format, addYears, isPast, formatDistanceToNow } from "date-fns";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button, StatusBadge, Avatar, InfoRow } from "@/components/ui/Modal";
import { DocumentGrid } from "@/components/ui/ImageViewer";
import AddMemberModal from "./AddMemberModal";
import { deleteMember } from "@/app/actions/member";

// Status tabs configuration
const TABS = [
    { id: 'all', label: 'All Members' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'expired', label: 'Expired' },
    { id: 'blocked', label: 'Blocked' },
];

type Member = {
    id: string;
    full_name: string;
    email: string;
    cnic: string;
    contact_number: string;
    membership_status: string;
    role: string;
    membership_type?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    created_at: string;
    profile_photo_url?: string;
    father_name?: string;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    city?: string;
    province?: string;
    residential_address?: string;
    qualification?: string;
    registration_number?: string;
    institution?: string;
    designation?: string;
    employment_status?: string;
    college_attended?: string;
};

export default function MemberManagement() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [memberDocuments, setMemberDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [registrationInput, setRegistrationInput] = useState("");
    const [memberToApprove, setMemberToApprove] = useState<Member | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchMembers();
    }, [activeTab]);

    // Fetch documents when member is selected
    useEffect(() => {
        if (selectedMember) {
            fetchMemberDocuments(selectedMember.id);
        } else {
            setMemberDocuments([]);
        }
    }, [selectedMember]);

    const fetchMembers = async () => {
        setLoading(true);
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

        if (activeTab !== 'all') {
            query = query.eq('membership_status', activeTab);
        }

        const { data, error } = await query;
        if (error) {
            toast.error("Failed to load members");
        } else {
            setMembers(data || []);
        }
        setLoading(false);
    };

    const fetchMemberDocuments = async (userId: string) => {
        setLoadingDocs(true);
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (data) {
            const docsWithUrls = await Promise.all(data.map(async (doc) => {
                if (doc.document_type === 'profile_photo') return doc;
                const { data: signedData } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(doc.file_url, 3600);
                return {
                    ...doc,
                    signedUrl: signedData?.signedUrl || doc.file_url
                };
            }));
            setMemberDocuments(docsWithUrls);
        }
        setLoadingDocs(false);
    };

    const handleAction = async (id: string, action: 'approve' | 'block' | 'reject' | 'revoke' | 'renew', registrationNumber?: string) => {
        setActionLoading(id);
        const member = members.find(m => m.id === id);
        if (!member) return;

        const updateData: any = { updated_at: new Date().toISOString() };
        let successMessage = '';

        if (action === 'approve') {
            const startDate = new Date();
            const endDate = addYears(startDate, 1);
            updateData.membership_status = 'active';
            updateData.subscription_start_date = startDate.toISOString();
            updateData.subscription_end_date = endDate.toISOString();
            if (registrationNumber) updateData.registration_number = registrationNumber;
            successMessage = 'Member approved & activated for 1 year';
        } else if (action === 'renew') {
            const baseDate = (member.subscription_end_date && !isPast(new Date(member.subscription_end_date)))
                ? new Date(member.subscription_end_date)
                : new Date();
            const endDate = addYears(baseDate, 1);
            updateData.membership_status = 'active';
            updateData.subscription_end_date = endDate.toISOString();
            successMessage = 'Subscription renewed for 1 year';
        } else if (action === 'block') {
            updateData.membership_status = 'blocked';
            successMessage = 'Member blocked';
        } else if (action === 'revoke') {
            updateData.membership_status = 'revoked';
            successMessage = 'Subscription revoked';
        } else if (action === 'reject') {
            updateData.membership_status = 'rejected';
            successMessage = 'Application rejected';
        }

        const { error } = await supabase.from('profiles').update(updateData).eq('id', id);

        if (error) {
            toast.error(`Failed to ${action} member`);
        } else {
            toast.success(successMessage);
            setMembers(members.map(m => m.id === id ? { ...m, ...updateData } : m));
            if (selectedMember?.id === id) {
                setSelectedMember({ ...selectedMember, ...updateData });
                if (['block', 'revoke', 'reject'].includes(action)) setSelectedMember(null);
            }
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this member? This action cannot be undone.")) return;

        setActionLoading(id);
        const { error } = await deleteMember(id);

        if (error) {
            toast.error(error);
        } else {
            toast.success("Member processed for deletion");
            setMembers(members.filter(m => m.id !== id));
            setSelectedMember(null);
        }
        setActionLoading(null);
    };

    const runExpirationScan = async () => {
        setLoading(true);
        toast.info("Scanning for expired memberships...");

        const now = new Date().toISOString();
        const { data: candidates } = await supabase
            .from('profiles')
            .select('id, subscription_end_date')
            .eq('membership_status', 'active')
            .lt('subscription_end_date', now);

        if (!candidates || candidates.length === 0) {
            toast.success("No expired memberships found.");
            setLoading(false);
            return;
        }

        let updatedCount = 0;
        for (const m of candidates) {
            const { error } = await supabase.from('profiles').update({ membership_status: 'expired' }).eq('id', m.id);
            if (!error) updatedCount++;
        }

        toast.success(`Marked ${updatedCount} memberships as expired.`);
        fetchMembers();
    };

    const handleVerifyDocument = async (doc: any) => {
        const newStatus = !doc.verified;
        const { error } = await supabase
            .from('documents')
            .update({ verified: newStatus, verified_at: newStatus ? new Date().toISOString() : null })
            .eq('id', doc.id);

        if (error) {
            toast.error("Failed to update document status");
        } else {
            toast.success(newStatus ? "Document verified" : "Verification revoked");
            setMemberDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, verified: newStatus } : d));
        }
    };

    const openApproveModal = (member: Member) => {
        // Close detail modal first for better UX
        setSelectedMember(null);
        // Small delay to let the detail modal close smoothly
        setTimeout(() => {
            setMemberToApprove(member);
            setRegistrationInput("");
            setApproveModalOpen(true);
        }, 150);
    };

    const confirmApproval = async () => {
        if (!memberToApprove) return;
        if (!registrationInput.trim()) {
            toast.error("Please enter a registration number");
            return;
        }
        setActionLoading(memberToApprove.id);
        await handleAction(memberToApprove.id, 'approve', registrationInput);
        setApproveModalOpen(false);
        setMemberToApprove(null);
        setActionLoading(null);
        // Refresh the list
        fetchMembers();
    };

    // Get tab counts
    const tabCounts = {
        all: members.length,
        active: members.filter(m => m.membership_status === 'active').length,
        pending: members.filter(m => m.membership_status === 'pending').length,
        expired: members.filter(m => m.membership_status === 'expired').length,
        blocked: members.filter(m => m.membership_status === 'blocked').length,
    };

    // Table columns
    const columns = [
        {
            key: 'full_name',
            header: 'Member',
            sortable: true,
            render: (_: any, row: Member) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.profile_photo_url} name={row.full_name} size="sm" />
                    <div>
                        <p className="font-medium text-gray-900">{row.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{row.cnic}</p>
                        {row.registration_number && (
                            <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded w-fit mt-0.5">
                                #{row.registration_number}
                            </p>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            header: 'Contact',
            render: (_: string, row: Member) => (
                <div className="text-sm">
                    <p className="text-gray-900">{row.email}</p>
                    <p className="text-gray-500">{row.contact_number || '-'}</p>
                </div>
            )
        },
        {
            key: 'membership_status',
            header: 'Status',
            render: (val: string) => <StatusBadge status={val || 'pending'} />
        },
        {
            key: 'subscription_end_date',
            header: 'Subscription',
            sortable: true,
            render: (val: string, row: Member) => {
                if (!val) return <span className="text-gray-400 text-sm">-</span>;
                const isExpired = isPast(new Date(val));
                return (
                    <div className="text-sm">
                        <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                            {format(new Date(val), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isExpired ? `Expired ${formatDistanceToNow(new Date(val))} ago` : `Expires in ${formatDistanceToNow(new Date(val))}`}
                        </p>
                    </div>
                );
            }
        },
        {
            key: 'created_at',
            header: 'Joined',
            sortable: true,
            render: (val: string) => (
                <span className="text-sm text-gray-600">
                    {format(new Date(val), 'MMM d, yyyy')}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
                    <p className="text-gray-500 mt-1">Manage memberships, approvals, and subscriptions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={runExpirationScan}
                        icon={<Clock className="w-4 h-4" />}
                    >
                        Scan Expired
                    </Button>
                    <Link href="/dashboard/members/import">
                        <Button variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
                            Import CSV
                        </Button>
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        icon={<UserPlus className="w-4 h-4" />}
                    >
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const count = tabCounts[tab.id as keyof typeof tabCounts];
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Data Table */}
            <DataTable
                data={members}
                columns={columns}
                pageSize={20}
                searchable={true}
                searchPlaceholder="Search by name, CNIC, email..."
                searchKeys={['full_name', 'cnic', 'email', 'contact_number', 'city']}
                onRowClick={(row) => setSelectedMember(row)}
                idKey="id"
                loading={loading}
                emptyMessage="No members found"
                actions={(row) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setSelectedMember(row)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        {row.membership_status === 'pending' ? (
                            <>
                                <button
                                    onClick={() => openApproveModal(row)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Approve"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleAction(row.id, 'reject')}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleAction(row.id, 'renew')}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Renew Subscription"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                {row.membership_status !== 'blocked' && (
                                    <button
                                        onClick={() => handleAction(row.id, 'block')}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Block Member"
                                    >
                                        <Ban className="w-4 h-4" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            />

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchMembers(); }}
            />

            {/* Approve Member Modal */}
            <Modal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                title="Approve Membership"
                subtitle="Assign a permanent registration number to this member"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            onClick={confirmApproval}
                            loading={!!(memberToApprove && actionLoading === memberToApprove.id)}
                            icon={<Check className="w-4 h-4" />}
                        >
                            Confirm Approval
                        </Button>
                    </>
                }
            >
                <div className="p-6 space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                        <p className="text-sm text-emerald-800 font-medium">
                            You are about to approve <strong>{memberToApprove?.full_name}</strong>.
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                            This will activate their membership for 1 year.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={registrationInput}
                            onChange={(e) => setRegistrationInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono placeholder:text-gray-400"
                            placeholder="e.g. SOOOP-MEM-2024-001"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            A unique identifier for this member.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Member Detail Modal */}
            <Modal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                title="Member Details"
                subtitle={selectedMember?.email}
                size="xl"
                footer={
                    selectedMember && (
                        <>
                            <Button variant="secondary" onClick={() => setSelectedMember(null)}>
                                Close
                            </Button>
                            {selectedMember.membership_status === 'pending' ? (
                                <>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleAction(selectedMember.id, 'reject')}
                                        loading={actionLoading === selectedMember.id}
                                        icon={<X className="w-4 h-4" />}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => selectedMember && openApproveModal(selectedMember)}
                                        loading={actionLoading === selectedMember.id}
                                        icon={<Check className="w-4 h-4" />}
                                    >
                                        Approve & Activate
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="success"
                                        onClick={() => handleAction(selectedMember.id, 'renew')}
                                        loading={actionLoading === selectedMember.id}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    >
                                        Renew 1 Year
                                    </Button>
                                    {selectedMember.membership_status !== 'blocked' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleAction(selectedMember.id, 'block')}
                                            loading={actionLoading === selectedMember.id}
                                            icon={<Ban className="w-4 h-4" />}
                                        >
                                            Block
                                        </Button>
                                    )}
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(selectedMember.id)}
                                        loading={actionLoading === selectedMember.id}
                                        icon={<Trash2 className="w-4 h-4" />}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </>
                    )
                }
            >
                {selectedMember && (
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left: Member Info */}
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <Avatar src={selectedMember.profile_photo_url} name={selectedMember.full_name} size="lg" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedMember.full_name}</h3>
                                        <p className="text-sm text-gray-600 font-mono">{selectedMember.cnic}</p>
                                        <div className="flex gap-2 mt-2">
                                            <StatusBadge status={selectedMember.membership_status || 'pending'} />
                                            <span className="px-2 py-0.5 bg-white text-gray-600 text-xs font-medium rounded border">
                                                {selectedMember.role || 'member'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Card */}
                                {selectedMember.subscription_end_date && (
                                    <div className={`p-4 rounded-xl border ${isPast(new Date(selectedMember.subscription_end_date)) ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</p>
                                                <p className={`text-lg font-bold ${isPast(new Date(selectedMember.subscription_end_date)) ? 'text-red-700' : 'text-emerald-700'}`}>
                                                    {isPast(new Date(selectedMember.subscription_end_date)) ? 'Expired' : 'Active'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {format(new Date(selectedMember.subscription_end_date), 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {isPast(new Date(selectedMember.subscription_end_date))
                                                        ? `Expired ${formatDistanceToNow(new Date(selectedMember.subscription_end_date))} ago`
                                                        : `${formatDistanceToNow(new Date(selectedMember.subscription_end_date))} remaining`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Personal Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
                                    <div className="space-y-0.5">
                                        <InfoRow label="Father's Name" value={selectedMember.father_name} />
                                        <InfoRow label="Date of Birth" value={selectedMember.date_of_birth ? format(new Date(selectedMember.date_of_birth), 'MMM d, yyyy') : undefined} />
                                        <InfoRow label="Gender" value={selectedMember.gender} />
                                        <InfoRow label="Blood Group" value={selectedMember.blood_group} />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                                    <div className="space-y-0.5">
                                        <InfoRow label="Email" value={selectedMember.email} />
                                        <InfoRow label="Phone" value={selectedMember.contact_number} />
                                        <InfoRow label="City" value={selectedMember.city} />
                                        <InfoRow label="Province" value={selectedMember.province} />
                                        <InfoRow label="Address" value={selectedMember.residential_address} />
                                    </div>
                                </div>

                                {/* Professional Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Professional & Education</h4>
                                    <div className="space-y-0.5">
                                        <InfoRow label="Qualification" value={selectedMember.qualification} />
                                        <InfoRow label="Institution" value={selectedMember.institution || selectedMember.college_attended} />
                                        <InfoRow label="Designation" value={selectedMember.designation} />
                                        <InfoRow label="Employment Status" value={selectedMember.employment_status} />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Documents */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Uploaded Documents
                                    </h4>
                                    {loadingDocs && (
                                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    )}
                                </div>

                                {!loadingDocs && (
                                    <DocumentGrid
                                        documents={memberDocuments}
                                        onVerify={handleVerifyDocument}
                                        highlightType="payment_proof"
                                    />
                                )}

                                {/* System Meta */}
                                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        System Information
                                    </h4>
                                    <div className="space-y-0.5 text-sm">
                                        <InfoRow label="Member Since" value={format(new Date(selectedMember.created_at), 'MMMM d, yyyy')} />
                                        <InfoRow label="Member ID" value={selectedMember.id.slice(0, 8) + '...'} mono />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
