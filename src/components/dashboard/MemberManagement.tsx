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
import AdminDocumentViewer from "./AdminDocumentViewer";

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
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header Control Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Community Management</h2>
                    <p className="text-gray-500 mt-1">Manage memberships, approvals, and subscriptions.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl hover:bg-primary-800 transition-all shadow-lg shadow-primary-900/20 font-semibold hover:-translate-y-0.5"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Member</span>
                </button>
            </div>

            {/* Controls Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-xl p-1.5 flex flex-col md:flex-row gap-2">
                {/* Segmented Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar flex-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${isActive
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'pending' && members.filter(m => m.membership_status === 'pending').length > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                                        {members.filter(m => m.membership_status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or CNIC..."
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all text-sm outline-none font-medium text-gray-700 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
                <div className="overflow-auto flex-1 custom-scrollbar relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Member Profile</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Subscription</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                            <p className="text-gray-400 text-sm font-medium">Fetching community data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-32 text-center">
                                        <div className="mx-auto w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 transform rotate-3">
                                            <Search className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-lg">No Results Found</h3>
                                        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">We couldn't find any members matching your search or filter criteria.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                                            className="mt-4 text-primary font-semibold text-sm hover:underline"
                                        >
                                            Clear Filters
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 p-[2px] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => { setSelectedMember(member); setShowModal(true); }}>
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                                                        {member.profile_photo_url ? (
                                                            <Image src={member.profile_photo_url} alt={member.full_name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-bold text-lg select-none">
                                                                {member.full_name?.[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-900 text-sm hover:text-primary cursor-pointer transition-colors" onClick={() => { setSelectedMember(member); setShowModal(true); }}>
                                                            {member.full_name}
                                                        </p>
                                                        {member.role === 'student' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold uppercase tracking-wider">Student</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono">{member.cnic}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{member.institution || member.city || 'No Location'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.membership_status === 'approved' && (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                                </span>
                                            )}
                                            {member.membership_status === 'pending' && (
                                                <span className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                                    <Clock className="w-3 h-3" /> Reviewing
                                                </span>
                                            )}
                                            {member.membership_status === 'blocked' && (
                                                <span className="inline-flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                                                    <Ban className="w-3 h-3" /> Blocked
                                                </span>
                                            )}
                                            {(member.membership_status === 'expired' || member.membership_status === 'revoked') && (
                                                <span className="inline-flex items-center gap-1.5 text-gray-600 text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                    <AlertTriangle className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.subscription_end_date ? (
                                                <div>
                                                    <p className={`text-sm font-semibold ${isPast(new Date(member.subscription_end_date)) ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {format(new Date(member.subscription_end_date), 'MMM d, yyyy')}
                                                    </p>
                                                    <div className="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isPast(new Date(member.subscription_end_date)) ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, ((new Date(member.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24 * 365)) * 100))}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Subscription</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-all duration-200">
                                                <button
                                                    onClick={() => { setSelectedMember(member); setShowModal(true); }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {member.membership_status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            onClick={() => handleAction(member.id, 'approve')}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            onClick={() => handleAction(member.id, 'reject')}
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
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

            {/* HIGH END MEMBER DETAIL MODAL */}
            {showModal && selectedMember && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-[#F8FAFC] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">

                        {/* HERO HEADER */}
                        <div className="relative bg-primary-900 h-48 flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-black/50"></div>
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* CONTENT WRAPPER */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="px-8 pb-8 -mt-20 relative z-10">
                                {/* Summary Card */}
                                <div className="flex flex-col md:flex-row gap-6 mb-8">
                                    <div className="w-40 h-40 rounded-3xl bg-white p-2 shadow-xl shrink-0 mx-auto md:mx-0">
                                        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-100">
                                            {selectedMember.profile_photo_url ? (
                                                <Image src={selectedMember.profile_photo_url} alt="Profile" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                                                    {selectedMember.full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-20 md:pt-24 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900 leading-none mb-2">{selectedMember.full_name}</h2>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-gray-500 font-medium">
                                                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{selectedMember.role}</span>
                                                    <span>•</span>
                                                    <span>{selectedMember.institution || 'Unknown Institution'}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm border
                                                ${selectedMember.membership_status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                                                ${selectedMember.membership_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                                                ${selectedMember.membership_status === 'blocked' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                            `}>
                                                {selectedMember.membership_status.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex items-center gap-3 mb-8 p-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                                    <button className="flex-1 min-w-[120px] px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Reset Password
                                    </button>
                                    <div className="w-px h-6 bg-gray-200 my-auto"></div>
                                    {selectedMember.membership_status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleAction(selectedMember.id, 'approve')} className="flex-1 min-w-[120px] bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20">
                                                Approve Application
                                            </button>
                                            <button onClick={() => handleAction(selectedMember.id, 'reject')} className="flex-1 min-w-[120px] text-red-600 px-4 py-2 text-sm font-bold hover:bg-red-50 rounded-lg transition-colors">
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleAction(selectedMember.id, 'revoke')} className="flex-1 min-w-[120px] text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 text-sm font-bold rounded-lg transition-colors">
                                            Revoke Access
                                        </button>
                                    )}
                                </div>

                                {/* Two Column Grid */}
                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* Left Data Column */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                                <UserPlus className="w-5 h-5 text-primary" /> Personal Information
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                                                    <p className="text-gray-900 font-medium break-all">{selectedMember.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">CNIC Number</label>
                                                    <p className="text-gray-900 font-medium font-mono tracking-tight">{selectedMember.cnic}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                                                    <p className="text-gray-900 font-medium">{selectedMember.contact_number}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">City / Location</label>
                                                    <p className="text-gray-900 font-medium">{selectedMember.city || 'Not Specified'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary" /> Professional Details
                                            </h3>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Institution</label>
                                                    <p className="text-gray-900 font-medium">{selectedMember.institution || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Qualification</label>
                                                    <p className="text-gray-900 font-medium">{selectedMember.qualification || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary" /> Verification Documents
                                            </h3>
                                            <AdminDocumentViewer userId={selectedMember.id} />
                                        </div>

                                    </div>

                                    {/* Right Meta Column */}
                                    <div className="space-y-6">
                                        {selectedMember.subscription_end_date && (
                                            <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                        <Shield className="w-5 h-5 text-accent-400" /> Subscription
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-primary-200 text-xs font-bold uppercase">Expires On</p>
                                                            <p className="text-2xl font-bold">{format(new Date(selectedMember.subscription_end_date), 'MMM d, yyyy')}</p>
                                                        </div>
                                                        <div className="pt-4 border-t border-white/10">
                                                            <p className="text-primary-200 text-xs font-bold uppercase">Started</p>
                                                            <p className="text-sm opacity-80">{format(new Date(selectedMember.subscription_start_date!), 'MMM d, yyyy')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Circles */}
                                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2"></div>
                                            </div>
                                        )}

                                        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200/50">
                                            <h4 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3">System Metadata</h4>
                                            <ul className="space-y-3 text-sm">
                                                <li className="flex justify-between">
                                                    <span className="text-gray-500">Joined</span>
                                                    <span className="font-medium text-gray-900">{format(new Date(selectedMember.created_at), 'MMM d, yyyy')}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span className="text-gray-500">ID</span>
                                                    <span className="font-mono text-xs text-gray-400 truncate max-w-[100px]">{selectedMember.id}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
