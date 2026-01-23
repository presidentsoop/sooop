"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, Award, User, Loader2, X, Check, ArrowRight, Upload, ImageIcon } from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";
import Image from "next/image";

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
};

export default function LeadershipManager() {
    const [activeTab, setActiveTab] = useState<'cabinet' | 'wings' | 'history'>('cabinet');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [wings, setWings] = useState<Wing[]>([]);

    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetchers
    const loadData = async () => {
        setIsLoading(true);
        if (activeTab === 'wings') {
            const { data: w, error } = await supabase.from('wings').select(`*, wing_members(*)`);
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

    // Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentHistory, setCurrentHistory] = useState<Partial<HistoryItem>>({});

    // Wing Modal State
    const [isWingModalOpen, setIsWingModalOpen] = useState(false);
    const [currentWingMember, setCurrentWingMember] = useState<Partial<WingMember>>({});
    const wingFileInputRef = useRef<HTMLInputElement>(null);

    // Wing Details Modal
    const [isWingDetailsModalOpen, setIsWingDetailsModalOpen] = useState(false);
    const [currentWingDetails, setCurrentWingDetails] = useState<Partial<Wing>>({});

    const saveWingDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWingDetails.id) return;

        const { error } = await supabase.from('wings').update({
            name: currentWingDetails.name,
            description: currentWingDetails.description,
            slug: currentWingDetails.slug
        }).eq('id', currentWingDetails.id);

        if (error) { toast.error("Failed to update wing"); }
        else {
            await logAuditAction('update_wing', { id: currentWingDetails.id });
            toast.success("Wing updated");
            setIsWingDetailsModalOpen(false);
            loadData();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `leadership/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('cms-media').upload(filePath, file);

        if (uploadError) {
            toast.error("Error uploading image");
            setIsUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(filePath);

        setCurrentHistory(prev => ({ ...prev, image_url: publicUrl }));
        setIsUploading(false);
        toast.success("Image uploaded");
    };

    const saveHistory = async (e: React.FormEvent) => {
        e.preventDefault();

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

        if (error) {
            toast.error("Failed to save");
            console.error(error);
        } else {
            setIsHistoryModalOpen(false);
            loadData();
            toast.success("Saved successfully");
        }
    };



    const deleteHistory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        const { error } = await supabase.from('leadership_history').delete().eq('id', id);
        if (error) toast.error("Failed to delete");
        else {
            await logAuditAction('delete_history', { id });
            loadData();
            toast.success("Deleted successfully");
        }
    };

    // Wing Handlers
    const handleWingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsUploading(true);
        const file = e.target.files[0];
        const fileName = `wing-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const filePath = `leadership/${fileName}`;
        const { error } = await supabase.storage.from('cms-media').upload(filePath, file);
        if (error) {
            toast.error("Error uploading");
            setIsUploading(false);
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(filePath);
        setCurrentWingMember(prev => ({ ...prev, manual_image: publicUrl }));
        setIsUploading(false);
        toast.success("Image uploaded");
    };

    const saveWingMember = async (e: React.FormEvent) => {
        e.preventDefault();
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

        if (error) { toast.error("Failed"); console.error(error); }
        else {
            await logAuditAction(currentWingMember.id ? 'update_wing_member' : 'add_wing_member', payload);
            setIsWingModalOpen(false); loadData(); toast.success("Saved Member");
        }
    };

    const deleteWingMember = async (id: string) => {
        if (!confirm("Delete this member?")) return;
        const { error } = await supabase.from('wing_members').delete().eq('id', id);
        if (error) toast.error("Failed"); else {
            await logAuditAction('delete_wing_member', { id });
            loadData(); toast.success("Deleted");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Leadership Management</h2>
                        <p className="text-gray-500 text-sm">Manage executive cabinet, professional wings, and organizational history.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-100 mb-6 overflow-x-auto scrollbar-none">
                    {['cabinet', 'wings', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'cabinet' ? 'Current Cabinet' : tab === 'wings' ? 'Professional Wings' : 'History & Founders'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                ) : (
                    <>
                        {activeTab !== 'wings' ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="text-sm text-blue-800">
                                        Managing <strong>{activeTab === 'cabinet' ? 'Current Executive Committee' : 'Past Presidents & Founders'}</strong>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCurrentHistory({
                                                category: activeTab === 'cabinet' ? 'cabinet' : 'past_president',
                                                start_year: new Date().getFullYear()
                                            });
                                            setIsHistoryModalOpen(true);
                                        }}
                                        className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus className="w-4 h-4" /> Add Member
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:shadow-lg transition-all group relative overflow-hidden">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                                {item.image_url ? (
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : <User className="w-full h-full p-4 text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0 z-10">
                                                <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{item.role}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.start_year} - {item.end_year || 'Present'}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white/80 backdrop-blur rounded p-1">
                                                <button onClick={() => { setCurrentHistory(item); setIsHistoryModalOpen(true); }} className="p-1.5 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => deleteHistory(item.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>

                                            {/* bg decoration */}
                                            <div className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 transform rotate-12 z-0 pointer-events-none">
                                                <Award className="w-24 h-24" />
                                            </div>
                                        </div>
                                    ))}
                                    {data.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            No records found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-4 bg-purple-50 text-purple-800 rounded-xl border border-purple-100 text-sm flex items-start gap-3">
                                    <div className="mt-0.5 bg-purple-100 p-1 rounded-full"><Check className="w-3 h-3" /></div>
                                    <div>
                                        <p className="font-bold">Wings Management</p>
                                        <p className="opacity-80">View assigned members. To assign new members, verify their profiles first in the Members section.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {wings.map(wing => (
                                        <div key={wing.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="bg-gray-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                                        <Award className="w-5 h-5 text-accent" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{wing.name}</h3>
                                                        <p className="text-xs text-gray-500 font-mono">{wing.slug}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setCurrentWingDetails(wing); setIsWingDetailsModalOpen(true); }}
                                                        className="btn btn-sm btn-ghost text-xs border border-gray-200"
                                                    >
                                                        <Edit className="w-3 h-3 mr-1" /> Edit Wing
                                                    </button>
                                                    <button
                                                        onClick={() => { setCurrentWingMember({ wing_id: wing.id }); setIsWingModalOpen(true); }}
                                                        className="btn btn-sm btn-outline text-xs"
                                                    >
                                                        + Add Member
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-0">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 bg-gray-50/30">
                                                            <th className="px-6 py-3 font-medium">Role</th>
                                                            <th className="px-6 py-3 font-medium">Assigned Member</th>
                                                            <th className="px-6 py-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {wing.wing_members?.map((m: any) => (
                                                            <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-3 font-bold text-gray-800">{m.role}</td>
                                                                <td className="px-6 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative">
                                                                            {(m.manual_image || m.profile?.avatar_url) ? (
                                                                                <Image src={m.manual_image || m.profile?.avatar_url} alt="" fill className="object-cover" />
                                                                            ) : <User className="w-3 h-3 m-1.5 text-gray-400" />}
                                                                        </div>
                                                                        <span className="text-gray-700">{m.manual_name || 'Linked Profile'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3">
                                                                    <div className="flex gap-2 justify-end">
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 mr-auto">Active</span>
                                                                        <button onClick={() => { setCurrentWingMember(m); setIsWingModalOpen(true); }} className="text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                                                                        <button onClick={() => deleteWingMember(m.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {(!wing.wing_members || wing.wing_members.length === 0) && (
                                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No members assigned</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal for History/Cabinet */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">{currentHistory.id ? 'Edit' : 'Add'} Record</h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={saveHistory} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                                        {currentHistory.image_url ? (
                                            <img src={currentHistory.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-500">Upload</span>
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg transform translate-x-1 translate-y-1">
                                        <Upload className="w-3 h-3" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. Dr. Ali Khan" value={currentHistory.name || ''} onChange={e => setCurrentHistory({ ...currentHistory, name: e.target.value })} required />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Official Role</label>
                                    <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. President, General Secretary" value={currentHistory.role || ''} onChange={e => setCurrentHistory({ ...currentHistory, role: e.target.value })} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Start Year</label>
                                        <input type="number" className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" placeholder="2024" value={currentHistory.start_year || ''} onChange={e => setCurrentHistory({ ...currentHistory, start_year: +e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">End Year</label>
                                        <input type="number" className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" placeholder="Empty if Current" value={currentHistory.end_year || ''} onChange={e => setCurrentHistory({ ...currentHistory, end_year: e.target.value ? +e.target.value : undefined })} />
                                    </div>
                                </div>

                                {activeTab === 'history' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                                        <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" value={currentHistory.category} onChange={e => setCurrentHistory({ ...currentHistory, category: e.target.value as any })}>
                                            <option value="past_president">Past President</option>
                                            <option value="founder">Founder</option>
                                            <option value="cabinet">Cabinet (Historical Info)</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Short Bio</label>
                                    <textarea className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none resize-none" placeholder="Brief professional biography..." rows={2} value={currentHistory.bio || ''} onChange={e => setCurrentHistory({ ...currentHistory, bio: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full btn btn-primary py-3 mt-4 shadow-lg shadow-primary/25">Save Record</button>
                        </form>
                    </div>
                </div>
            )}


            {/* Wing Member Modal */}
            {
                isWingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-lg text-gray-900">{currentWingMember.id ? 'Edit' : 'Add'} Wing Member</h3>
                                <button onClick={() => setIsWingModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={saveWingMember} className="p-6 space-y-4">
                                {/* Image Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer" onClick={() => wingFileInputRef.current?.click()}>
                                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                                            {currentWingMember.manual_image ? (
                                                <img src={currentWingMember.manual_image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-2">
                                                    <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                                    <span className="text-[10px] text-gray-500">Upload</span>
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg transform translate-x-1 translate-y-1">
                                            <Upload className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={wingFileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleWingImageUpload}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                        <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Member Name" value={currentWingMember.manual_name || ''} onChange={e => setCurrentWingMember({ ...currentWingMember, manual_name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Role in Wing</label>
                                        <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. President, GS" value={currentWingMember.role || ''} onChange={e => setCurrentWingMember({ ...currentWingMember, role: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn btn-primary py-3 mt-4 shadow-lg shadow-primary/25">Save Member</button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Wing Details Modal */}
            {isWingDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">Edit Wing Details</h3>
                            <button onClick={() => setIsWingDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={saveWingDetails} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Wing Name</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" value={currentWingDetails.name || ''} onChange={e => setCurrentWingDetails({ ...currentWingDetails, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Slug (URL)</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" value={currentWingDetails.slug || ''} onChange={e => setCurrentWingDetails({ ...currentWingDetails, slug: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none resize-none" rows={3} value={currentWingDetails.description || ''} onChange={e => setCurrentWingDetails({ ...currentWingDetails, description: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-3 mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}
