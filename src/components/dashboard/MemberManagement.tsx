"use client";

import { useState, useEffect } from "react";
import {
    Search, Filter, ChevronDown, Check, X, Ban, MoreVertical,
    Eye, UserPlus, XCircle, CheckCircle, FileText, Download,
    Calendar, Clock, Shield, AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import AddMemberModal from "./AddMemberModal";
import { format, addYears, isPast } from "date-fns";

type Member = {
    id: string;
    full_name: string;
    email: string;
    cnic: string;
    contact_number: string;
    membership_status: string;
    role: string;
    institution?: string;
    qualification?: string;
    city?: string;
    created_at: string;
    profile_photo_url?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
};

// UX: Tabs for better organization (Facebook Groups style)
const TABS = [
    { id: 'all', label: 'All Members' },
    { id: 'pending', label: 'Membership Requests' },
    { id: 'approved', label: 'Active Members' },
    { id: 'expired', label: 'Expired' },
];

export default function MemberManagement() {
    const supabase = createClient();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [activeTab]);

    const fetchMembers = async () => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter based on Tab
        if (activeTab === 'pending') {
            query = query.eq('membership_status', 'pending');
        } else if (activeTab === 'approved') {
            query = query.eq('membership_status', 'approved');
        } else if (activeTab === 'expired') {
            // This relies on status being updated to 'expired' or just checking dates logic client side?
            // Ideally status is source of truth.
            // Let's assume we filter by status 'expired' OR dates logic if needed.
            // For now, simple status check.
            query = query.or('membership_status.eq.expired,membership_status.eq.revoked');
        }

        const { data, error } = await query;
        if (error) {
            toast.error("Failed to load members");
        } else {
            console.log(data);
            // Client-side date check for expiration visualization (optional enhancement)
            const processed = (data || []).map((m: any) => ({
                ...m,
                is_expired_technically: m.subscription_end_date && isPast(new Date(m.subscription_end_date))
            }));
            setMembers(processed);
        }
        setLoading(false);
    };

    const filteredMembers = members.filter(m =>
        (m.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m.cnic || '').includes(searchTerm) ||
        (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleAction = async (id: string, action: 'approve' | 'block' | 'reject' | 'revoke') => {
        const updateData: any = {};
        let newStatus = 'pending';
        let successMessage = '';

        if (action === 'approve') {
            newStatus = 'approved';
            const startDate = new Date();
            const endDate = addYears(startDate, 1);
            updateData.membership_status = newStatus;
            updateData.subscription_start_date = startDate.toISOString();
            updateData.subscription_end_date = endDate.toISOString();
            successMessage = 'Member Approved & Subscription Activated for 1 Year';
        } else if (action === 'block') {
            newStatus = 'blocked';
            updateData.membership_status = newStatus;
            successMessage = 'Member access blocked';
        } else if (action === 'revoke') {
            newStatus = 'revoked';
            updateData.membership_status = newStatus;
            // Optionally clear dates or keep record
            successMessage = 'Subscription access revoked';
        } else if (action === 'reject') {
            newStatus = 'rejected';
            updateData.membership_status = newStatus;
            successMessage = 'Application rejected';
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id);

        if (error) {
            toast.error(`Failed to ${action} member`);
        } else {
            toast.success(successMessage);
            setMembers(members.map(m => m.id === id ? { ...m, ...updateData } : m));
            if (selectedMember && selectedMember.id === id) {
                setShowModal(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Control Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Community Management</h2>
                    <p className="text-gray-500 text-sm">Manage memberships, approvals, and subscriptions.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition shadow-sm font-medium"
                >
                    <UserPlus className="w-5 h-5" /> Add Member
                </button>
            </div>

            {/* Tabs & Search Bar (Facebook style separate container) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between p-2">
                    {/* Tabs */}
                    <div className="flex overflow-x-auto no-scrollbar">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'pending' && members.filter(m => m.membership_status === 'pending').length > 0 && activeTab !== 'pending' && (
                                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        New
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-2 w-full md:w-80">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-medium tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
                                        <p className="text-gray-500 text-sm">Loading community data...</p>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center">
                                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <UserPlus className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-900 font-medium">No members found</p>
                                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 relative overflow-hidden border border-gray-100">
                                                    {member.profile_photo_url ? (
                                                        <Image src={member.profile_photo_url} alt={member.full_name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-bold text-lg">
                                                            {member.full_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900 text-sm">{member.full_name}</p>
                                                        {member.role === 'student' && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">Student</span>}
                                                        {member.role === 'professional' && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">Pro</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{member.email}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{member.institution || member.city}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.membership_status === 'approved' && (
                                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 px-3 py-1 rounded-full w-fit">
                                                    <CheckCircle className="w-4 h-4" /> Active
                                                </div>
                                            )}
                                            {member.membership_status === 'pending' && (
                                                <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium bg-yellow-50 px-3 py-1 rounded-full w-fit">
                                                    <Clock className="w-4 h-4" /> Pending Review
                                                </div>
                                            )}
                                            {member.membership_status === 'blocked' && (
                                                <div className="flex items-center gap-2 text-red-700 text-sm font-medium bg-red-50 px-3 py-1 rounded-full w-fit">
                                                    <Ban className="w-4 h-4" /> Blocked
                                                </div>
                                            )}
                                            {(member.membership_status === 'expired' || member.membership_status === 'revoked') && (
                                                <div className="flex items-center gap-2 text-gray-700 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full w-fit">
                                                    <AlertTriangle className="w-4 h-4" /> Expired
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.subscription_end_date ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Expires {format(new Date(member.subscription_end_date), 'MMM d, yyyy')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Started {format(new Date(member.subscription_start_date!), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No active subscription</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedMember(member); setShowModal(true); }}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>

                                                {member.membership_status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"
                                                            onClick={() => handleAction(member.id, 'approve')}
                                                            title="Approve & Activate"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                                            onClick={() => handleAction(member.id, 'reject')}
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {member.membership_status === 'approved' && (
                                                    <button
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition"
                                                        onClick={() => handleAction(member.id, 'revoke')}
                                                        title="Revoke Access"
                                                    >
                                                        <Shield className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddMemberModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchMembers(); }}
            />

            {/* View/Edit Modal (Can be extracted) */}
            {showModal && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Member Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-8">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                                <div className="w-32 h-32 rounded-2xl bg-gray-100 relative overflow-hidden shadow-card border-4 border-white">
                                    {selectedMember.profile_photo_url ? (
                                        <Image src={selectedMember.profile_photo_url} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                                            {selectedMember.full_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900">{selectedMember.full_name}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedMember.membership_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedMember.membership_status}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-600 mb-4">{selectedMember.role} • {selectedMember.institution}</p>

                                    <div className="flex flex-wrap gap-3">
                                        {selectedMember.membership_status === 'pending' ? (
                                            <>
                                                <button onClick={() => handleAction(selectedMember.id, 'approve')} className="btn btn-primary px-6">
                                                    Approve Application
                                                </button>
                                                <button onClick={() => handleAction(selectedMember.id, 'reject')} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-6">
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleAction(selectedMember.id, 'revoke')} className="btn bg-red-50 hover:bg-red-100 text-red-600 px-6">
                                                Revoke Membership
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <h4 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2 mb-4">
                                        <UserPlus className="w-5 h-5 text-gray-400" /> Personal Info
                                    </h4>
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">Email</dt>
                                            <dd className="text-gray-900">{selectedMember.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">Phone</dt>
                                            <dd className="text-gray-900">{selectedMember.contact_number}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">CNIC</dt>
                                            <dd className="text-gray-900">{selectedMember.cnic}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">City</dt>
                                            <dd className="text-gray-900">{selectedMember.city || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2 mb-4">
                                        <FileText className="w-5 h-5 text-gray-400" /> Professional Info
                                    </h4>
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">Current Institution</dt>
                                            <dd className="text-gray-900">{selectedMember.institution || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-500 uppercase font-semibold">Qualification</dt>
                                            <dd className="text-gray-900">{selectedMember.qualification || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Subscription Info */}
                            {selectedMember.subscription_end_date && (
                                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
                                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Subscription Status
                                    </h4>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase">Start Date</p>
                                            <p className="text-blue-900 font-medium">{format(new Date(selectedMember.subscription_start_date!), 'MMMM d, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase">Expiration Date</p>
                                            <p className="text-blue-900 font-medium">{format(new Date(selectedMember.subscription_end_date), 'MMMM d, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase">Days Remaining</p>
                                            {/* Calculate days remaining roughly */}
                                            <p className="text-blue-900 font-medium">
                                                {Math.ceil((new Date(selectedMember.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
