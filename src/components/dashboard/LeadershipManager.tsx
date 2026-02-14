"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, Award, User, Loader2, Upload, ImageIcon, Check } from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";
import Image from "next/image";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button, Avatar, StatusBadge } from "@/components/ui/Modal";

// Types
type HistoryItem = {
    id: string;
    name: string;
    role: string;
    category: 'cabinet' | 'past_president' | 'founder';
    start_year: number;
    end_year?: number;
    bio?: string;
    image_url?: string;
};

type Wing = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    wing_members: WingMember[];
};

type WingMember = {
    id: string;
    wing_id: string;
    role: string;
    manual_name?: string;
    manual_image?: string;
    profile_id?: string;
    is_active: boolean;
    created_at: string;
    profile?: { avatar_url?: string };
};

export default function LeadershipManager() {
    const [activeTab, setActiveTab] = useState<'cabinet' | 'wings' | 'history'>('cabinet');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<HistoryItem[]>([]);
    const [wings, setWings] = useState<Wing[]>([]);

    // Modal & Selection States
    const [currentHistory, setCurrentHistory] = useState<Partial<HistoryItem> | null>(null);
    const [currentWingMember, setCurrentWingMember] = useState<Partial<WingMember> | null>(null);
    const [currentWingDetails, setCurrentWingDetails] = useState<Partial<Wing> | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wingFileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const loadData = async () => {
        setIsLoading(true);
        if (activeTab === 'wings') {
            const { data: w, error } = await supabase.from('wings').select(`*, wing_members(*, profile:profiles(avatar_url))`);
            if (error) toast.error("Failed to load wings");
            else setWings(w || []);
        } else {
            let query = supabase.from('leadership_history').select('*').order('start_year', { ascending: false });
            if (activeTab === 'cabinet') query = query.eq('category', 'cabinet').is('end_year', null);
            else query = query.in('category', ['past_president', 'founder']);

            const { data: h, error } = await query;
            if (error) toast.error("Failed to load leadership data");
            else setData(h || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    // --- Image Upload Logic ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `leadership/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('cms-media').upload(filePath, file);

        if (uploadError) {
            toast.error("Error uploading image");
        } else {
            const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(filePath);
            setter(publicUrl);
            toast.success("Image uploaded");
        }
        setIsUploading(false);
    };

    // --- History / Cabinet Actions ---
    const saveHistory = async () => {
        if (!currentHistory) return;
        const payload = {
            name: currentHistory.name,
            role: currentHistory.role,
            category: activeTab === 'cabinet' ? 'cabinet' : currentHistory.category || 'past_president',
            start_year: currentHistory.start_year,
            end_year: currentHistory.end_year || null,
            bio: currentHistory.bio,
            image_url: currentHistory.image_url
        };

        const { error } = currentHistory.id
            ? await supabase.from('leadership_history').update(payload).eq('id', currentHistory.id)
            : await supabase.from('leadership_history').insert([payload]);

        if (error) { toast.error("Failed to save"); }
        else {
            setCurrentHistory(null);
            loadData();
            toast.success("Saved successfully");
        }
    };

    const deleteHistory = async (id: string) => {
        if (!confirm("Delete this record?")) return;
        const { error } = await supabase.from('leadership_history').delete().eq('id', id);
        if (error) toast.error("Failed"); else { loadData(); toast.success("Deleted"); }
    };

    // --- Wing Actions ---
    const saveWingMember = async () => {
        if (!currentWingMember) return;
        const payload = {
            wing_id: currentWingMember.wing_id,
            manual_name: currentWingMember.manual_name,
            role: currentWingMember.role,
            manual_image: currentWingMember.manual_image,
            is_active: true
        };
        const { error } = currentWingMember.id
            ? await supabase.from('wing_members').update(payload).eq('id', currentWingMember.id)
            : await supabase.from('wing_members').insert([payload]);

        if (error) { toast.error("Failed"); }
        else {
            setCurrentWingMember(null); loadData(); toast.success("Member saved");
        }
    };

    const saveWingDetails = async () => {
        if (!currentWingDetails?.id) return;
        const { error } = await supabase.from('wings').update({
            name: currentWingDetails.name,
            description: currentWingDetails.description,
            slug: currentWingDetails.slug
        }).eq('id', currentWingDetails.id);

        if (error) { toast.error("Failed"); }
        else {
            setCurrentWingDetails(null); loadData(); toast.success("Wing updated");
        }
    };

    const deleteWingMember = async (id: string) => {
        if (!confirm("Remove member?")) return;
        const { error } = await supabase.from('wing_members').delete().eq('id', id);
        if (error) toast.error("Failed"); else { loadData(); toast.success("Removed"); }
    };


    // History State Management
    useEffect(() => {
        if (currentHistory || currentWingMember || currentWingDetails) {
            let modalName = 'leadership-modal';
            if (currentHistory) modalName = 'history-modal';
            else if (currentWingMember) modalName = 'wing-member-modal';
            else if (currentWingDetails) modalName = 'wing-details-modal';

            window.history.pushState({ modal: modalName }, '');

            const handlePopState = () => {
                setCurrentHistory(null);
                setCurrentWingMember(null);
                setCurrentWingDetails(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentHistory, currentWingMember, currentWingDetails]);

    const handleCloseModal = () => {
        if (window.history.state?.modal?.includes('-modal')) {
            window.history.back();
        } else {
            setCurrentHistory(null);
            setCurrentWingMember(null);
            setCurrentWingDetails(null);
        }
    };

    // Mobile Renderers
    const renderMobileHistoryRow = (row: HistoryItem) => (
        <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
                <Avatar src={row.image_url} name={row.name} size="md" />
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{row.name}</p>
                    <p className="text-sm text-gray-500 truncate">{row.role}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{row.start_year} - {row.end_year || 'Present'}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setCurrentHistory(row)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit className="w-4 h-4" /></button>
            </div>
        </div>
    );

    const renderMobileWingMemberRow = (row: WingMember) => (
        <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
                <Avatar src={row.manual_image || row.profile?.avatar_url} name={row.manual_name || 'Member'} size="sm" />
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{row.manual_name || 'Linked Profile'}</p>
                    <p className="text-sm text-gray-500 truncate">{row.role}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setCurrentWingMember(row)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit className="w-4 h-4" /></button>
            </div>
        </div>
    );

    // --- Columns Definitions ---
    const historyColumns = [
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (_: any, row: HistoryItem) => (
                <div className="flex items-center gap-3">
                    <Avatar src={row.image_url} name={row.name} size="md" />
                    <div>
                        <p className="font-semibold text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{row.bio || 'No bio available'}</p>
                    </div>
                </div>
            )
        },
        { key: 'role', header: 'Role', render: (val: string) => <StatusBadge status={val} /> },
        {
            key: 'start_year',
            header: 'Tenure',
            render: (_: any, row: HistoryItem) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{row.start_year} - {row.end_year || 'Present'}</span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leadership Management</h1>
                    <p className="text-gray-500 mt-1">Manage executive cabinet, wings, and history</p>
                </div>
                {activeTab !== 'wings' && (
                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setCurrentHistory({
                            category: activeTab === 'cabinet' ? 'cabinet' : 'past_president',
                            start_year: new Date().getFullYear()
                        })}
                        className="w-full sm:w-auto justify-center"
                    >
                        Add Member
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                    {['cabinet', 'wings', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {tab === 'cabinet' ? 'Current Cabinet' : tab === 'wings' ? 'Professional Wings' : 'History'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab !== 'wings' ? (
                <DataTable
                    data={data}
                    columns={historyColumns}
                    loading={isLoading}
                    searchable
                    searchKeys={['name', 'role']}
                    mobileRenderer={renderMobileHistoryRow}
                    actions={(row) => (
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentHistory(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteHistory(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}
                />
            ) : (
                <div className="space-y-8">
                    {wings.map(wing => (
                        <div key={wing.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                        <Award className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{wing.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{wing.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentWingDetails(wing)} icon={<Edit className="w-3 h-3" />} className="flex-1 sm:flex-none justify-center">Edit Wing</Button>
                                    <Button variant="secondary" size="sm" onClick={() => setCurrentWingMember({ wing_id: wing.id })} icon={<Plus className="w-3 h-3" />} className="flex-1 sm:flex-none justify-center">Add Member</Button>
                                </div>
                            </div>
                            <DataTable
                                data={wing.wing_members || []}
                                columns={[
                                    {
                                        key: 'manual_name',
                                        header: 'Member',
                                        render: (_: any, row: WingMember) => (
                                            <div className="flex items-center gap-3">
                                                <Avatar src={row.manual_image || row.profile?.avatar_url} name={row.manual_name || 'Member'} size="sm" />
                                                <span className="font-medium text-gray-900">{row.manual_name || 'Linked Profile'}</span>
                                            </div>
                                        )
                                    },
                                    { key: 'role', header: 'Role', render: (val: string) => <span className="font-medium text-gray-700">{val}</span> },
                                    { key: 'is_active', header: 'Status', render: () => <StatusBadge status="active" /> }
                                ]}
                                mobileRenderer={renderMobileWingMemberRow}
                                actions={(row) => (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setCurrentWingMember(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteWingMember(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                                disablePagination
                                emptyMessage="No members assigned to this wing yet."
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* History Modal */}
            <Modal
                isOpen={!!currentHistory}
                onClose={handleCloseModal}
                title={currentHistory?.id ? 'Edit Record' : 'Add Record'}
                size="md"
                footer={<><Button variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button variant="primary" onClick={saveHistory}>{currentHistory?.id ? 'Save' : 'Create'}</Button></>}
            >
                <div className="p-6 space-y-4">
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar src={currentHistory?.image_url} name={currentHistory?.name || 'User'} size="xl" className="w-24 h-24 ring-4 ring-gray-50" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            {isUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setCurrentHistory(prev => prev ? { ...prev, image_url: url } : null))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentHistory?.name || ''} onChange={e => setCurrentHistory(prev => prev ? { ...prev, name: e.target.value } : null)} placeholder="e.g. Dr. Ali Khan" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Official Role</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentHistory?.role || ''} onChange={e => setCurrentHistory(prev => prev ? { ...prev, role: e.target.value } : null)} placeholder="e.g. President" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                            <input type="number" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentHistory?.start_year || ''} onChange={e => setCurrentHistory(prev => prev ? { ...prev, start_year: +e.target.value } : null)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                            <input type="number" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentHistory?.end_year || ''} onChange={e => setCurrentHistory(prev => prev ? { ...prev, end_year: +e.target.value } : null)} placeholder="Present" />
                        </div>
                    </div>
                    {activeTab === 'history' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentHistory?.category} onChange={e => setCurrentHistory(prev => prev ? { ...prev, category: e.target.value as any } : null)}>
                                <option value="past_president">Past President</option>
                                <option value="founder">Founder</option>
                                <option value="cabinet">Cabinet</option>
                            </select>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Wing Member Modal */}
            <Modal
                isOpen={!!currentWingMember}
                onClose={handleCloseModal}
                title={currentWingMember?.id ? 'Edit Member' : 'Add Wing Member'}
                size="md"
                footer={<><Button variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button variant="primary" onClick={saveWingMember}>Save Member</Button></>}
            >
                <div className="p-6 space-y-4">
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => wingFileInputRef.current?.click()}>
                            <Avatar src={currentWingMember?.manual_image} name={currentWingMember?.manual_name || 'Member'} size="xl" className="w-24 h-24 ring-4 ring-gray-50" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                            {isUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                        </div>
                        <input type="file" ref={wingFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setCurrentWingMember(prev => prev ? { ...prev, manual_image: url } : null))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentWingMember?.manual_name || ''} onChange={e => setCurrentWingMember(prev => prev ? { ...prev, manual_name: e.target.value } : null)} placeholder="Member Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role in Wing</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentWingMember?.role || ''} onChange={e => setCurrentWingMember(prev => prev ? { ...prev, role: e.target.value } : null)} placeholder="e.g. Secretary" />
                    </div>
                </div>
            </Modal>

            {/* Wing Detail Modal */}
            <Modal
                isOpen={!!currentWingDetails}
                onClose={handleCloseModal}
                title="Edit Wing Details"
                size="md"
                footer={<><Button variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button variant="primary" onClick={saveWingDetails}>Save Changes</Button></>}
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wing Name</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentWingDetails?.name || ''} onChange={e => setCurrentWingDetails(prev => prev ? { ...prev, name: e.target.value } : null)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={currentWingDetails?.slug || ''} onChange={e => setCurrentWingDetails(prev => prev ? { ...prev, slug: e.target.value } : null)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" rows={3} value={currentWingDetails?.description || ''} onChange={e => setCurrentWingDetails(prev => prev ? { ...prev, description: e.target.value } : null)} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
