"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, FileText, CreditCard, Clock, ChevronRight, User, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/app/actions/audit";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button, StatusBadge, Avatar, InfoRow } from "@/components/ui/Modal";
import { DocumentGrid } from "@/components/ui/ImageViewer";
import { format } from "date-fns";

interface VerifyListProps {
    initialMembers: any[];
}

export default function VerifyList({ initialMembers }: VerifyListProps) {
    const [members, setMembers] = useState(initialMembers);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [memberDocuments, setMemberDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [quickViewDoc, setQuickViewDoc] = useState<any | null>(null);

    const supabase = createClient();

    // Fetch documents when member is selected
    useEffect(() => {
        if (selectedMember) {
            const fetchDocs = async () => {
                setLoadingDocs(true);
                const { data } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('user_id', selectedMember.id);

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
                } else {
                    setMemberDocuments([]);
                }
                setLoadingDocs(false);
            };
            fetchDocs();
        } else {
            setMemberDocuments([]);
        }
    }, [selectedMember, supabase]);

    // Quick view transaction slip for a member
    const fetchTransactionSlip = async (member: any) => {
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', member.id)
            .eq('document_type', 'payment_proof')
            .single();

        if (data) {
            const { data: signedData } = await supabase.storage
                .from('documents')
                .createSignedUrl(data.file_url, 3600);
            setQuickViewDoc({
                ...data,
                signedUrl: signedData?.signedUrl || data.file_url,
                memberName: member.full_name
            });
        } else {
            toast.error("No transaction slip found for this member");
        }
    };

    const handleBulkAction = async (decision: 'approved' | 'rejected') => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to ${decision} ${selectedIds.size} applications?`)) return;

        setProcessing('bulk');
        const ids = Array.from(selectedIds);
        let successCount = 0;

        try {
            for (const id of ids) {
                await processDecision(id, decision);
                successCount++;
            }
            toast.success(`Successfully ${decision} ${successCount} applications.`);
            setMembers(prev => prev.filter(m => !selectedIds.has(m.id)));
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Some operations failed. Please refresh.");
        } finally {
            setProcessing(null);
        }
    };

    const processDecision = async (id: string, decision: 'approved' | 'rejected') => {
        const member = members.find(m => m.id === id);
        if (!member) return;

        const updateData: any = {
            membership_status: decision === 'approved' ? 'active' : decision,
            updated_at: new Date().toISOString()
        };

        if (decision === 'approved') {
            const now = new Date();
            const oneYearLater = new Date(now);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            updateData.subscription_start_date = now.toISOString();
            updateData.subscription_end_date = oneYearLater.toISOString();
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id);

        if (profileError) throw profileError;

        await supabase.from('membership_applications')
            .update({ status: decision, reviewed_at: new Date().toISOString() })
            .eq('user_id', id);

        await logAuditAction(decision === 'approved' ? 'MEMBER_APPROVED' : 'MEMBER_REJECTED', {
            member_name: member.full_name,
            member_id: id
        });
    };

    const handleSingleAction = async (member: any, decision: 'approved' | 'rejected') => {
        setProcessing(member.id);
        try {
            await processDecision(member.id, decision);
            toast.success(`Application ${decision}!`);
            setMembers(prev => prev.filter(m => m.id !== member.id));
            setSelectedMember(null);
        } catch (error) {
            toast.error("Action failed. Please try again.");
        } finally {
            setProcessing(null);
        }
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

    // Table columns
    const columns = [
        {
            key: 'full_name',
            header: 'Applicant',
            sortable: true,
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.profile_photo_url} name={row.full_name} size="sm" />
                    <div>
                        <p className="font-medium text-gray-900">{row.full_name}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'cnic',
            header: 'CNIC',
            render: (val: string) => <span className="font-mono text-gray-700">{val}</span>
        },
        {
            key: 'membership_type',
            header: 'Type',
            render: (val: string) => (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded capitalize">
                    {val || 'Standard'}
                </span>
            )
        },
        {
            key: 'province',
            header: 'Location'
        },
        {
            key: 'created_at',
            header: 'Applied',
            sortable: true,
            render: (val: string) => format(new Date(val), 'MMM d, yyyy')
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
                    <p className="text-gray-500 mt-1">
                        {members.length} pending application{members.length !== 1 ? 's' : ''} awaiting review
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">{members.length} Pending</span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={members}
                columns={columns}
                pageSize={15}
                searchable={true}
                searchPlaceholder="Search by name, CNIC, or email..."
                searchKeys={['full_name', 'cnic', 'email', 'province']}
                onRowClick={(row) => setSelectedMember(row)}
                idKey="id"
                emptyMessage="No pending applications"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                bulkActions={
                    <>
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleBulkAction('approved')}
                            loading={processing === 'bulk'}
                            icon={<Check className="w-4 h-4" />}
                        >
                            Approve Selected
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleBulkAction('rejected')}
                            loading={processing === 'bulk'}
                            icon={<X className="w-4 h-4" />}
                        >
                            Reject Selected
                        </Button>
                    </>
                }
                actions={(row) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchTransactionSlip(row)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Quick View Transaction Slip"
                        >
                            <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSelectedMember(row)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Full Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleSingleAction(row, 'approved')}
                            disabled={processing === row.id}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleSingleAction(row, 'rejected')}
                            disabled={processing === row.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />

            {/* Quick View Transaction Slip Modal */}
            <Modal
                isOpen={!!quickViewDoc}
                onClose={() => setQuickViewDoc(null)}
                title="Transaction Slip"
                subtitle={quickViewDoc?.memberName}
                size="lg"
            >
                <div className="p-6">
                    {quickViewDoc && (
                        <div className="space-y-4">
                            <img
                                src={quickViewDoc.signedUrl}
                                alt="Transaction Slip"
                                className="w-full max-h-[60vh] object-contain rounded-lg border border-gray-200"
                            />
                            <div className="flex items-center justify-between pt-4 border-t">
                                <StatusBadge status={quickViewDoc.verified ? 'active' : 'pending'} />
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => window.open(quickViewDoc.signedUrl, '_blank')}
                                        icon={<Eye className="w-4 h-4" />}
                                    >
                                        Full Size
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => {
                                            // Find and approve the member
                                            const member = members.find(m => {
                                                return memberDocuments.some(d => d.id === quickViewDoc.id && d.user_id === m.id);
                                            }) || members.find(m => m.full_name === quickViewDoc.memberName);
                                            if (member) {
                                                handleSingleAction(member, 'approved');
                                                setQuickViewDoc(null);
                                            }
                                        }}
                                        icon={<Check className="w-4 h-4" />}
                                    >
                                        Approve Application
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Member Detail Modal */}
            <Modal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                title="Application Review"
                subtitle={selectedMember?.full_name}
                size="xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setSelectedMember(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleSingleAction(selectedMember, 'rejected')}
                            loading={processing === selectedMember?.id}
                            icon={<X className="w-4 h-4" />}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="success"
                            onClick={() => handleSingleAction(selectedMember, 'approved')}
                            loading={processing === selectedMember?.id}
                            icon={<Check className="w-4 h-4" />}
                        >
                            Approve & Activate
                        </Button>
                    </>
                }
            >
                {selectedMember && (
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left: Personal Info */}
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <Avatar src={selectedMember.profile_photo_url} name={selectedMember.full_name} size="lg" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedMember.full_name}</h3>
                                        <p className="text-sm text-gray-500">{selectedMember.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <StatusBadge status={selectedMember.membership_status || 'pending'} />
                                            {selectedMember.membership_type && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                                    {selectedMember.membership_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Personal Information
                                    </h4>
                                    <div className="space-y-0.5">
                                        <InfoRow label="CNIC" value={selectedMember.cnic} mono />
                                        <InfoRow label="Father's Name" value={selectedMember.father_name} />
                                        <InfoRow label="Date of Birth" value={selectedMember.date_of_birth ? format(new Date(selectedMember.date_of_birth), 'MMM d, yyyy') : '-'} />
                                        <InfoRow label="Gender" value={selectedMember.gender} />
                                        <InfoRow label="Blood Group" value={selectedMember.blood_group} />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-0.5">
                                        <InfoRow label="Phone" value={selectedMember.contact_number || selectedMember.phone} />
                                        <InfoRow label="Email" value={selectedMember.email} />
                                        <InfoRow label="City" value={selectedMember.city} />
                                        <InfoRow label="Province" value={selectedMember.province} />
                                        <InfoRow label="Address" value={selectedMember.residential_address} />
                                    </div>
                                </div>

                                {/* Professional Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        Professional & Education
                                    </h4>
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

                                {/* Application Meta */}
                                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Application Details
                                    </h4>
                                    <div className="space-y-0.5 text-sm">
                                        <InfoRow label="Applied On" value={format(new Date(selectedMember.created_at), 'MMMM d, yyyy')} />
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
