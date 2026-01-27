"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Loader2, FileText, Calendar, Building2, Phone, MapPin, User, Shield, GraduationCap, CreditCard, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { logAuditAction } from "@/app/actions/audit";

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

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

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
                    // Generate Signed URLs for private docs
                    const docsWithUrls = await Promise.all(data.map(async (doc) => {
                        if (doc.document_type === 'profile_photo') return doc;

                        // For private docs in 'documents' bucket
                        const { data: signedData } = await supabase.storage
                            .from('documents')
                            .createSignedUrl(doc.file_url, 3600); // 1 hour link

                        return {
                            ...doc,
                            file_url: signedData?.signedUrl || doc.file_url
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

    const handleBulkAction = async (decision: 'approved' | 'rejected') => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to ${decision} ${selectedIds.size} applications?`)) return;

        setProcessing('bulk');
        const ids = Array.from(selectedIds);
        let successCount = 0;

        try {
            for (const id of ids) {
                await processDecisionInternal(id, decision);
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

    const processDecisionInternal = async (id: string, decision: 'approved' | 'rejected') => {
        const memberName = members.find(m => m.id === id)?.full_name || 'Unknown';
        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                membership_status: decision === 'approved' ? 'active' : decision,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (profileError) throw profileError;

        // 2. Update Application (if pending)
        await supabase
            .from('membership_applications')
            .update({ status: decision })
            .eq('user_id', id)
            .eq('status', 'pending');

        // 3. Verify Docs
        if (decision === 'approved') {
            await supabase.from('documents').update({ verified: true }).eq('user_id', id);
        }

        // Log Audit
        await logAuditAction(
            decision === 'approved' ? 'approve_member' : 'reject_member',
            { userId: id, name: memberName }
        );
    };

    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        setProcessing(id);
        try {
            await processDecisionInternal(id, decision);
            toast.success(`Application ${decision} successfully`);
            setMembers(prev => prev.filter(m => m.id !== id));
            if (selectedMember?.id === id) setSelectedMember(null);
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setProcessing(null);
        }
    };

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Check className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500 max-w-sm mx-auto">There are no pending membership applications to review at this time. Great job!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="sticky top-0 z-20 bg-primary-900 text-white p-3 rounded-xl shadow-lg flex items-center justify-between mb-4 animate-scale-in">
                    <div className="flex items-center gap-4 px-2">
                        <span className="font-bold text-sm bg-primary-800 px-3 py-1 rounded-lg border border-primary-700">{selectedIds.size} Selected</span>
                        <span className="text-sm opacity-80">Choose an action to apply to all</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('rejected')}
                            disabled={!!processing}
                            className="bg-red-500/20 hover:bg-red-500 text-red-100 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-500/30"
                        >
                            Reject All
                        </button>
                        <button
                            onClick={() => handleBulkAction('approved')}
                            disabled={!!processing}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-lg flex items-center gap-2"
                        >
                            {processing === 'bulk' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Approve All
                        </button>
                    </div>
                </div>
            )}

            {members.map((member) => (
                <div
                    key={member.id}
                    className={`group bg-white p-6 rounded-2xl border transition-all duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-6 animate-slide-up relative overflow-hidden ${selectedIds.has(member.id) ? 'border-primary-500 ring-1 ring-primary-500 shadow-md bg-primary-50/10' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>

                    {/* Checkbox */}
                    <div className="absolute top-6 left-6 z-10">
                        <input
                            type="checkbox"
                            checked={selectedIds.has(member.id)}
                            onChange={() => toggleSelection(member.id)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-start gap-5 flex-1 w-full pl-10">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0 shadow-inner cursor-pointer" onClick={() => setSelectedMember(member)}>
                            {member.profile_photo_url ? (
                                <Image src={member.profile_photo_url} alt={member.full_name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50 text-xl">
                                    {member.full_name?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h3
                                    className="font-bold text-gray-900 text-lg hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    {member.full_name}
                                </h3>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                                    {member.membership_type}
                                </span>
                                {member.province && (
                                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {member.province}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500 mt-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="font-mono text-gray-700">{member.cnic}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{member.contact_number || member.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">{member.designation || member.occupation || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">{member.qualification || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-gray-100">
                        <button
                            onClick={() => setSelectedMember(member)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden xl:block mx-1"></div>
                        <button
                            onClick={() => handleDecision(member.id, 'rejected')}
                            disabled={!!processing}
                            className="flex-1 xl:flex-none px-5 py-2.5 border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl font-semibold text-sm transition disabled:opacity-50 hover:shadow-sm"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleDecision(member.id, 'approved')}
                            disabled={!!processing}
                            className="flex-1 xl:flex-none bg-primary-900 hover:bg-primary-800 text-white px-8 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {processing === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> Approve
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}

            {/* Member Details Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-scale-in flex flex-col my-4 max-h-[95vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-200 border-4 border-white shadow-md overflow-hidden relative">
                                    {selectedMember.profile_photo_url ? (
                                        <Image src={selectedMember.profile_photo_url} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-4 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl text-gray-900">{selectedMember.full_name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{selectedMember.father_name && `S/O ${selectedMember.father_name}`}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-bold bg-primary-100 text-primary-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                            {selectedMember.membership_type}
                                        </span>
                                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {selectedMember.province || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">

                            {/* Personal & Contact Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Personal Information</h4>
                                    <dl className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <dt className="text-gray-500 text-xs mb-1">CNIC Number</dt>
                                            <dd className="font-mono font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">{selectedMember.cnic}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500 text-xs mb-1">Date of Birth</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.date_of_birth || selectedMember.dob || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500 text-xs mb-1">Gender</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.gender || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500 text-xs mb-1">Blood Group</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.blood_group || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Contact Details</h4>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Email:</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.email}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Phone:</dt>
                                            <dd className="font-mono font-medium text-gray-900">{selectedMember.contact_number || selectedMember.phone || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500 text-xs mb-1">Residential Address:</dt>
                                            <dd className="font-medium text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 text-sm leading-relaxed">
                                                {selectedMember.residential_address || selectedMember.address || 'N/A'}
                                                <br />
                                                <span className="text-gray-500 text-xs mt-1 block">{selectedMember.city}, {selectedMember.province}</span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Academic & Professional */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Academic & Professional
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">Education</h5>
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">Qualification</p>
                                                <p className="font-bold text-gray-800">{selectedMember.qualification || 'N/A'}</p>
                                                {selectedMember.other_qualification && <p className="text-xs text-gray-600 mt-1">({selectedMember.other_qualification})</p>}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">College / Institution</p>
                                                <p className="font-medium text-gray-800">{selectedMember.college_attended || selectedMember.institution || 'N/A'}</p>
                                            </div>
                                            {(selectedMember.has_relevant_pg || selectedMember.has_non_relevant_pg) && (
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                    <p className="text-xs text-blue-600 mb-1 font-bold">Post Graduate</p>
                                                    <p className="font-medium text-blue-900">{selectedMember.post_graduate_institution || 'N/A'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">Employment</h5>
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                                <p className="font-medium text-gray-800">{selectedMember.employment_status || 'N/A'}</p>
                                            </div>
                                            {(selectedMember.employment_status !== 'Student' && selectedMember.employment_status !== 'Unemployed') && (
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500 mb-1">Current Role</p>
                                                    <p className="font-bold text-gray-800">{selectedMember.designation}</p>
                                                    <p className="text-xs text-gray-600 mt-1">at {selectedMember.current_status || selectedMember.institution || 'Unknown'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Attached Documents
                            </h4>

                            {loadingDocs ? (
                                <div className="flex items-center justify-center p-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Documents...
                                </div>
                            ) : memberDocuments.length === 0 ? (
                                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    No documents attached.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* PRIORITIZE PAYMENT PROOF */}
                                    {memberDocuments.filter(d => d.document_type === 'payment_proof').map((doc) => (
                                        <div key={doc.id} className="border-2 border-green-500/20 bg-green-50/10 rounded-xl overflow-hidden shadow-sm col-span-1 md:col-span-2 relative group">
                                            <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex justify-between items-center">
                                                <span className="text-sm font-bold uppercase text-green-700 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" /> Bank Payment Receipt
                                                </span>
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-50 transition flex items-center gap-1">
                                                    View Full <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <div className="relative aspect-[3/1] bg-gray-100 cursor-pointer" onClick={() => window.open(doc.file_url, '_blank')}>
                                                <Image
                                                    src={doc.file_url}
                                                    alt="Payment Proof"
                                                    fill
                                                    className="object-contain p-2"
                                                    unoptimized
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* OTHER DOCUMENTS */}
                                    {memberDocuments.filter(d => d.document_type !== 'payment_proof').map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white group">
                                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-gray-500 truncate max-w-[150px]">{doc.document_type.replace(/_/g, ' ')}</span>
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <div className="relative aspect-video bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(doc.file_url, '_blank')}>
                                                {(doc.file_url.toLowerCase().includes('.pdf') || doc.file_url.includes('content-type=application%2Fpdf')) ? (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                                        <FileText className="w-12 h-12 text-red-400" />
                                                        <span className="text-xs font-medium text-gray-500">PDF Document</span>
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={doc.file_url}
                                                        alt={doc.document_type}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                            <button
                                onClick={() => handleDecision(selectedMember.id, 'rejected')}
                                className="flex-1 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition"
                            >
                                Reject Application
                            </button>
                            <button
                                onClick={() => handleDecision(selectedMember.id, 'approved')}
                                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-800 shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Approve Membership
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
