"use client";

import { useState } from "react";
import { Check, X, Eye, Loader2, FileText, Calendar, Building2, Phone, Mail, MapPin, User, Shield } from "lucide-react";
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
    const supabase = createClient();

    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        setProcessing(id);
        const memberName = members.find(m => m.id === id)?.full_name || 'Unknown';

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    membership_status: decision,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

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
                                    <span className="truncate max-w-[200px]">{member.designation || 'Member'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Applied: {new Date(member.created_at).toLocaleDateString()}</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
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
                                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Pending Review
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">CNIC Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-gray-700">
                                        <FileText className="w-4 h-4 text-gray-400" /> {selectedMember.cnic}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400" /> {selectedMember.contact_number || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Designation</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700">
                                        <Building2 className="w-4 h-4 text-gray-400" /> {selectedMember.designation || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Workplace / City</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {selectedMember.institute_name || selectedMember.city || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Home Address</label>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                                    {selectedMember.address || 'No address provided.'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-4">
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
