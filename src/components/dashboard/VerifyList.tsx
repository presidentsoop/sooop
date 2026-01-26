"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Loader2, FileText, Calendar, Building2, Phone, MapPin, User, Shield, GraduationCap, CreditCard, ExternalLink } from "lucide-react";
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
                        // Profile photo is public and already has full URL if saved correctly, 
                        // but if we saved path, we might need publicUrl.
                        // In Step 1703 we saved Full Public URL for profile_photo.
                        // For others, we saved PATH.

                        if (doc.document_type === 'profile_photo') {
                            return doc;
                        }

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

    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        setProcessing(id);
        const memberName = members.find(m => m.id === id)?.full_name || 'Unknown';

        try {
            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    membership_status: decision,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (profileError) throw profileError;

            // 2. Update Application Status (if exists)
            await supabase
                .from('membership_applications')
                .update({ status: decision })
                .eq('user_id', id)
                .eq('status', 'pending');

            // 3. Mark Documents as verified if approved (Optional, but good)
            if (decision === 'approved') {
                await supabase.from('documents').update({ verified: true }).eq('user_id', id);
            }

            // Log Audit
            await logAuditAction(
                decision === 'approved' ? 'approve_member' : 'reject_member',
                { userId: id, name: memberName }
            );

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
            {members.map((member) => (
                <div
                    key={member.id}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-6 animate-slide-up relative overflow-hidden"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>

                    <div className="flex items-start gap-5 flex-1 w-full">
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
                                    <span>{member.contact_number || 'N/A'}</span>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in flex flex-col my-4 max-h-[95vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-200 border-2 border-white shadow-md overflow-hidden relative">
                                    {selectedMember.profile_photo_url ? (
                                        <Image src={selectedMember.profile_photo_url} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-4 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{selectedMember.full_name}</h3>
                                    <p className="text-sm text-gray-500">{selectedMember.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {selectedMember.membership_type}
                                        </span>
                                        <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {selectedMember.province || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Profile Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">CNIC Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-gray-700 text-sm">
                                        <FileText className="w-4 h-4 text-gray-400" /> {selectedMember.cnic}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-gray-700 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" /> {selectedMember.contact_number || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">City / Province</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                                        <MapPin className="w-4 h-4 text-gray-400" /> {selectedMember.city}, {selectedMember.province}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Qualification</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                                        <GraduationCap className="w-4 h-4 text-gray-400" /> {selectedMember.qualification || 'N/A'}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Employment</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        {selectedMember.designation ? `${selectedMember.designation} at ` : ''}
                                        {selectedMember.institution || selectedMember.clinic_name || 'N/A'}
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
                                    {memberDocuments.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-gray-500">{doc.document_type.replace(/_/g, ' ')}</span>
                                                <a href={doc.file_url.startsWith('http') ? doc.file_url : '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <div className="relative aspect-video bg-gray-100 group cursor-pointer" onClick={() => window.open(doc.file_url.startsWith('http') ? doc.file_url : '#', '_blank')}>
                                                {doc.file_url && (doc.file_url.endsWith('.pdf') ? (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                                        <FileText className="w-12 h-12" />
                                                        <span className="text-sm">PDF Document</span>
                                                    </div>
                                                ) : (
                                                    // Note: If file_url is a path (private bucket), Image component might fail unless signed URL.
                                                    // In Step 1703, we stored PATH for documents, not publicUrl (except profile photo).
                                                    // So we might need to SIGN the URL here? or assumes Admin fetch works?
                                                    // Wait, Supabase client side can download if user is admin?
                                                    // Private buckets require signed URLs.
                                                    // I will handle this by fetching Signed URL in the Effect if needed.
                                                    // But for now, let's assume public or handle the error.
                                                    // Actually, I should Generate Signed URLs in the useEffect.
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                                                        Click Open to View (Private)
                                                    </div>
                                                ))}
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
                                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-800 shadow-lg shadow-primary/20 transition"
                            >
                                Approve Membership
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
