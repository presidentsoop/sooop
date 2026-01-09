"use client";

import { useState, useEffect } from "react";
import {
    Search, Filter, ChevronDown, Check, X, Ban, MoreVertical,
    Eye, UserPlus, XCircle, CheckCircle, FileText, Download, Briefcase
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import AddMemberModal from "./AddMemberModal";

type Member = {
    id: string;
    full_name: string;
    email: string; // from auth joined? actually profiles has email column
    cnic: string;
    contact_number: string;
    membership_status: string;
    role: string;
    institution?: string;
    qualification?: string;
    city?: string;
    created_at: string;
    profile_photo_url?: string;
};

export default function MembersTable() {
    const supabase = createClient();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null); // For Modal
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch Members
    useEffect(() => {
        fetchMembers();
    }, [statusFilter]); // Refetch when filter changes or initially

    const fetchMembers = async () => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('membership_status', statusFilter);
        }

        const { data, error } = await query;
        if (error) {
            toast.error("Failed to load members");
            console.error(error);
        } else {
            setMembers(data || []);
        }
        setLoading(false);
    };

    // Filter by search term locally
    const filteredMembers = members.filter(m =>
        (m.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m.cnic || '').includes(searchTerm) ||
        (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleAction = async (id: string, action: 'approve' | 'block' | 'reject') => {
        let newStatus = 'pending';
        if (action === 'approve') newStatus = 'approved';
        if (action === 'block') newStatus = 'blocked';
        if (action === 'reject') newStatus = 'rejected';

        const { error } = await supabase
            .from('profiles')
            .update({ membership_status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error(`Failed to ${action} member`);
        } else {
            toast.success(`Member ${newStatus}`);
            // Optimistic update
            setMembers(members.map(m => m.id === id ? { ...m, membership_status: newStatus } : m));
            if (selectedMember && selectedMember.id === id) {
                setSelectedMember({ ...selectedMember, membership_status: newStatus });
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, CNIC, email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        className="px-4 py-2 border rounded-lg bg-gray-50 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition"
                        onClick={() => setShowAddModal(true)}
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Member</span>
                    </button>

                    <AddMemberModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            fetchMembers();
                        }}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Member</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">CNIC / Contact</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                                        Loading members...
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No members found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                                    {member.profile_photo_url ? (
                                                        <Image src={member.profile_photo_url} alt={member.full_name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                                                            {member.full_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.full_name}</p>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{member.cnic}</p>
                                            <p className="text-xs text-gray-500">{member.contact_number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${member.role === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {member.role}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{member.city}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${member.membership_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                member.membership_status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${member.membership_status === 'approved' ? 'bg-green-500' :
                                                    member.membership_status === 'blocked' ? 'bg-red-500' :
                                                        'bg-yellow-500'
                                                    }`}></span>
                                                {member.membership_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedMember(member); setShowModal(true); }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>

                                                {member.membership_status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleAction(member.id, 'approve')}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {member.membership_status !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleAction(member.id, 'block')}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Block"
                                                    >
                                                        <Ban className="w-5 h-5" />
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

            {/* Detailed Modal */}
            {showModal && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <button
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative border-2 border-white shadow-lg">
                                    {selectedMember.profile_photo_url ? (
                                        <Image src={selectedMember.profile_photo_url} alt={selectedMember.full_name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-4xl text-gray-300">
                                            <UserPlus className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedMember.full_name}</h2>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${selectedMember.membership_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedMember.membership_status}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {selectedMember.role} • Joined {new Date(selectedMember.created_at).toLocaleDateString()}
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { handleAction(selectedMember.id, 'approve'); setShowModal(false); }}
                                            className="btn btn-primary btn-sm flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Approve Membership
                                        </button>
                                        <button
                                            onClick={() => { handleAction(selectedMember.id, 'block'); setShowModal(false); }}
                                            className="btn bg-red-50 text-red-600 hover:bg-red-100 btn-sm flex items-center gap-2"
                                        >
                                            <Ban className="w-4 h-4" /> Block Member
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-primary" /> Personal Details
                                    </h3>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">Email</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.email}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">CNIC</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.cnic}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">Contact</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.contact_number}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">City</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.city || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-primary" /> Professional Info
                                    </h3>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">Institution</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.institution || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-gray-500">Qualification</dt>
                                            <dd className="font-medium text-gray-900">{selectedMember.qualification || 'N/A'}</dd>
                                        </div>
                                        {/* Add more fields if available in profile schema */}
                                    </dl>
                                </div>
                            </div>

                            {/* Documents Section Mockup */}
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="font-bold text-gray-900 mb-4">Submitted Documents</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['CNIC Front', 'CNIC Back', 'Transcript', 'Payment Proof'].map((doc, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-3 text-center hover:bg-gray-50 transition cursor-pointer">
                                            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-xs font-medium text-gray-700">{doc}</p>
                                            <span className="text-[10px] text-blue-500 mt-1 flex items-center justify-center gap-1">
                                                <Download className="w-3 h-3" /> View/Download
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
