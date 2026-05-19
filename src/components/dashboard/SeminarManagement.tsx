"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, MapPin, Check, X, FileText, Image as ImageIcon, Users, Search } from "lucide-react";
import { format } from "date-fns";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button, StatusBadge } from "@/components/ui/Modal";
import { toggleAttendeeStatus, removeAttendee } from "@/app/actions/seminar";

type Seminar = {
    id: string;
    title: string;
    seminar_date: string;
    location: string;
    description: string;
    is_active: boolean;
    template_id: string | null;
};

type Template = {
    id: string;
    name: string;
    background_image_url: string;
    layout_config: any;
};

type Profile = {
    id: string;
    full_name: string;
    email: string;
    registration_number: string;
};

export default function SeminarManagement() {
    const [activeTab, setActiveTab] = useState<'seminars' | 'templates'>('seminars');
    
    // State for Seminars
    const [seminars, setSeminars] = useState<Seminar[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal states
    const [currentSeminar, setCurrentSeminar] = useState<Partial<Seminar> | null>(null);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<Template> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Attendees State
    const [attendeesModalSeminar, setAttendeesModalSeminar] = useState<Seminar | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentAttendees, setCurrentAttendees] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const supabase = createClient();

    const fetchData = async () => {
        setIsLoading(true);
        const [seminarsRes, templatesRes, profilesRes] = await Promise.all([
            supabase.from("seminars").select("*").order("seminar_date", { ascending: false }),
            supabase.from("certificate_templates").select("*").order("created_at", { ascending: false }),
            supabase.from("profiles").select("id, full_name, email, registration_number")
        ]);

        if (seminarsRes.error) toast.error("Failed to load seminars");
        else setSeminars(seminarsRes.data || []);

        if (templatesRes.error) toast.error("Failed to load templates");
        else setTemplates(templatesRes.data || []);

        if (profilesRes.error) toast.error("Failed to load profiles");
        else setProfiles(profilesRes.data || []);

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ATTENDEE ACTIONS
    const loadAttendees = async (seminarId: string) => {
        const { data } = await supabase.from('seminar_attendees').select('profile_id, attendance_status').eq('seminar_id', seminarId);
        setCurrentAttendees(data || []);
    };

    const openAttendeesModal = (seminar: Seminar) => {
        setAttendeesModalSeminar(seminar);
        setSearchQuery("");
        loadAttendees(seminar.id);
    };

    const handleAddAttendee = async (profileId: string) => {
        if (!attendeesModalSeminar) return;
        const res = await toggleAttendeeStatus(attendeesModalSeminar.id, profileId, 'approved');
        if (res.success) {
            toast.success("Added attendee");
            loadAttendees(attendeesModalSeminar.id);
        } else toast.error(res.error);
    };

    const handleRemoveAttendee = async (profileId: string) => {
        if (!attendeesModalSeminar) return;
        const res = await removeAttendee(attendeesModalSeminar.id, profileId);
        if (res.success) {
            toast.success("Removed attendee");
            loadAttendees(attendeesModalSeminar.id);
        } else toast.error(res.error);
    };

    // SEMINAR ACTIONS
    const handleSaveSeminar = async () => {
        if (!currentSeminar) return;
        setIsSaving(true);
        
        const dataToSave = {
            title: currentSeminar.title,
            seminar_date: currentSeminar.seminar_date,
            location: currentSeminar.location,
            description: currentSeminar.description,
            template_id: currentSeminar.template_id || null,
            is_active: currentSeminar.is_active ?? true
        };

        if (currentSeminar.id) {
            const { error } = await supabase.from("seminars").update(dataToSave).eq("id", currentSeminar.id);
            if (error) toast.error("Update failed");
            else { toast.success("Seminar updated"); setCurrentSeminar(null); fetchData(); }
        } else {
            const { error } = await supabase.from("seminars").insert([dataToSave]);
            if (error) toast.error("Creation failed");
            else { toast.success("Seminar created"); setCurrentSeminar(null); fetchData(); }
        }
        setIsSaving(false);
    };

    // TEMPLATE ACTIONS
    const handleSaveTemplate = async () => {
        if (!currentTemplate) return;
        setIsSaving(true);
        
        const dataToSave = {
            name: currentTemplate.name,
            background_image_url: currentTemplate.background_image_url,
            layout_config: typeof currentTemplate.layout_config === 'string' 
                ? JSON.parse(currentTemplate.layout_config || '{}') 
                : (currentTemplate.layout_config || {})
        };

        if (currentTemplate.id) {
            const { error } = await supabase.from("certificate_templates").update(dataToSave).eq("id", currentTemplate.id);
            if (error) toast.error("Update failed");
            else { toast.success("Template updated"); setCurrentTemplate(null); fetchData(); }
        } else {
            const { error } = await supabase.from("certificate_templates").insert([dataToSave]);
            if (error) toast.error("Creation failed");
            else { toast.success("Template created"); setCurrentTemplate(null); fetchData(); }
        }
        setIsSaving(false);
    };

    // COLUMNS
    const seminarColumns = [
        {
            key: 'title',
            header: 'Seminar Name',
            sortable: true,
            render: (val: string, row: Seminar) => (
                <div>
                    <p className="font-semibold text-gray-900">{val}</p>
                    {!row.is_active && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mt-1 inline-block">Inactive</span>}
                </div>
            )
        },
        {
            key: 'seminar_date',
            header: 'Date',
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" /> {format(new Date(val), 'MMM d, yyyy')}
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location',
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" /> {val}
                </div>
            )
        }
    ];

    const templateColumns = [
        {
            key: 'name',
            header: 'Template Name',
            render: (val: string) => <p className="font-semibold text-gray-900">{val}</p>
        },
        {
            key: 'background_image_url',
            header: 'Background URL',
            render: (val: string) => <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm truncate max-w-[200px] inline-block">{val}</a>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seminars & Certificates</h1>
                    <p className="text-gray-500 mt-1">Manage events and auto-generated certificates</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'seminars' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('seminars')}
                    >
                        Seminars
                    </button>
                    <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        Templates
                    </button>
                </div>
            </div>

            {activeTab === 'seminars' ? (
                <>
                    <div className="flex justify-end">
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCurrentSeminar({ title: '', location: '', description: '', is_active: true })}>
                            Create Seminar
                        </Button>
                    </div>
                    <DataTable
                        data={seminars}
                        columns={seminarColumns}
                        loading={isLoading}
                        searchable
                        searchKeys={['title', 'location']}
                        actions={(row) => (
                            <div className="flex items-center gap-2">
                                <button onClick={() => openAttendeesModal(row)} className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"><Users className="w-4 h-4" /> Attendees</button>
                                <button onClick={() => setCurrentSeminar(row)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            </div>
                        )}
                    />
                </>
            ) : (
                <>
                    <div className="flex justify-end">
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCurrentTemplate({ name: '', background_image_url: '', layout_config: '{\n  "name": { "x": 500, "y": 600, "fontSize": 32, "color": "#000000", "align": "center" },\n  "date": { "x": 200, "y": 800, "fontSize": 18, "color": "#555555", "align": "left" }\n}' })}>
                            Add Template
                        </Button>
                    </div>
                    <DataTable
                        data={templates}
                        columns={templateColumns}
                        loading={isLoading}
                        searchable
                        searchKeys={['name']}
                        actions={(row) => (
                            <button onClick={() => setCurrentTemplate({...row, layout_config: JSON.stringify(row.layout_config, null, 2)})} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        )}
                    />
                </>
            )}

            {/* Seminar Modal */}
            <Modal isOpen={!!currentSeminar} onClose={() => setCurrentSeminar(null)} title={currentSeminar?.id ? 'Edit Seminar' : 'Create Seminar'} size="lg" footer={
                <>
                    <Button variant="secondary" onClick={() => setCurrentSeminar(null)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveSeminar} loading={isSaving}>Save</Button>
                </>
            }>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentSeminar?.title || ''} onChange={e => setCurrentSeminar(p => p ? {...p, title: e.target.value} : null)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" className="w-full px-4 py-2 border rounded-lg" value={currentSeminar?.seminar_date || ''} onChange={e => setCurrentSeminar(p => p ? {...p, seminar_date: e.target.value} : null)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentSeminar?.location || ''} onChange={e => setCurrentSeminar(p => p ? {...p, location: e.target.value} : null)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Template</label>
                        <select className="w-full px-4 py-2 border rounded-lg" value={currentSeminar?.template_id || ''} onChange={e => setCurrentSeminar(p => p ? {...p, template_id: e.target.value} : null)}>
                            <option value="">Select a template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg" rows={3} value={currentSeminar?.description || ''} onChange={e => setCurrentSeminar(p => p ? {...p, description: e.target.value} : null)} />
                    </div>
                </div>
            </Modal>

            {/* Template Modal */}
            <Modal isOpen={!!currentTemplate} onClose={() => setCurrentTemplate(null)} title={currentTemplate?.id ? 'Edit Template' : 'Add Template'} size="lg" footer={
                <>
                    <Button variant="secondary" onClick={() => setCurrentTemplate(null)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveTemplate} loading={isSaving}>Save</Button>
                </>
            }>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Template Name</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg" value={currentTemplate?.name || ''} onChange={e => setCurrentTemplate(p => p ? {...p, name: e.target.value} : null)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Background Image URL</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." value={currentTemplate?.background_image_url || ''} onChange={e => setCurrentTemplate(p => p ? {...p, background_image_url: e.target.value} : null)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Coordinates JSON Config</label>
                        <textarea className="w-full px-4 py-2 border rounded-lg font-mono text-sm" rows={8} value={currentTemplate?.layout_config || ''} onChange={e => setCurrentTemplate(p => p ? {...p, layout_config: e.target.value} : null)} />
                    </div>
                </div>
            </Modal>

            {/* Attendees Modal */}
            <Modal isOpen={!!attendeesModalSeminar} onClose={() => setAttendeesModalSeminar(null)} title={`Manage Attendees: ${attendeesModalSeminar?.title}`} size="lg" footer={
                <Button variant="secondary" onClick={() => setAttendeesModalSeminar(null)}>Close</Button>
            }>
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                            placeholder="Search by name, email, or SOOOP ID to add..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg overflow-hidden h-96 flex flex-col">
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-gray-50 custom-scrollbar">
                            {searchQuery && profiles
                                .filter(p => 
                                    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    p.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .slice(0, 15)
                                .map(profile => {
                                    const isAttending = currentAttendees.some(a => a.profile_id === profile.id);
                                    return (
                                        <div key={profile.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{profile.full_name}</p>
                                                <p className="text-xs text-gray-500">{profile.registration_number || profile.email}</p>
                                            </div>
                                            {isAttending ? (
                                                <button onClick={() => handleRemoveAttendee(profile.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">Remove</button>
                                            ) : (
                                                <button onClick={() => handleAddAttendee(profile.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">Add to Seminar</button>
                                            )}
                                        </div>
                                    );
                            })}
                            
                            {!searchQuery && currentAttendees.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pt-2 mb-2">Confirmed Attendees ({currentAttendees.length})</h4>
                                    {currentAttendees.map(attendee => {
                                        const profile = profiles.find(p => p.id === attendee.profile_id);
                                        if (!profile) return null;
                                        return (
                                            <div key={profile.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-green-500">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">{profile.full_name}</p>
                                                    <p className="text-xs text-gray-500">{profile.registration_number || profile.email}</p>
                                                </div>
                                                <button onClick={() => handleRemoveAttendee(profile.id)} className="px-3 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Remove</button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            
                            {!searchQuery && currentAttendees.length === 0 && (
                                <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center gap-2">
                                    <Users className="w-8 h-8 text-gray-300" />
                                    No attendees added yet. <br/> Search above to add members to this seminar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
