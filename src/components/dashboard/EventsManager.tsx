"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, MapPin, Loader2, X, Check } from "lucide-react";
import { format } from "date-fns";

type Event = {
    id: string;
    title: string;
    start_date: string;
    end_date?: string;
    location: string;
    description: string;
    is_featured: boolean;
    status: string;
};

export default function EventsManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    const fetchEvents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("start_date", { ascending: false });

        if (error) {
            toast.error("Failed to load events");
        } else {
            setEvents(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const eventData = {
            title: currentEvent.title,
            start_date: currentEvent.start_date, // Ensure ISO format from input
            end_date: currentEvent.end_date || null,
            location: currentEvent.location,
            description: currentEvent.description,
            is_featured: currentEvent.is_featured || false,
            status: currentEvent.status || 'upcoming'
        };

        if (currentEvent.id) {
            // Update
            const { error } = await supabase.from("events").update(eventData).eq("id", currentEvent.id);
            if (error) toast.error("Failed to update event");
            else {
                toast.success("Event updated");
                setIsModalOpen(false);
                fetchEvents();
            }
        } else {
            // Create
            const { error } = await supabase.from("events").insert([eventData]);
            if (error) toast.error("Failed to create event");
            else {
                toast.success("Event created");
                setIsModalOpen(false);
                fetchEvents();
            }
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) toast.error("Failed to delete event");
        else {
            toast.success("Event deleted");
            fetchEvents();
        }
    };

    const openModal = (event?: Event) => {
        setCurrentEvent(event ? {
            ...event,
            start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
            end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''
        } : { status: 'upcoming', is_featured: false });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Events Management</h1>
                    <p className="text-gray-500 mt-2">Create and manage upcoming conferences and meetings.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-1 transition-all flex items-center gap-2 font-semibold"
                >
                    <Plus className="w-5 h-5" /> Create Event
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                            {/* Featured Ribbon */}
                            {event.is_featured && (
                                <div className="absolute top-0 right-0 bg-accent-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 uppercase tracking-wider">
                                    Featured
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${event.status === 'upcoming' ? 'bg-green-50 text-green-700 border-green-100' :
                                            event.status === 'past' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {event.status}
                                    </div>
                                </div>

                                <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{event.title}</h3>

                                <div className="space-y-3 text-sm text-gray-500 mb-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{format(new Date(event.start_date), 'PPP p')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-accent" />
                                        </div>
                                        <span className="font-medium truncate">{event.location}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 mt-auto">
                                    <button
                                        onClick={() => openModal(event)}
                                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all flex items-center justify-center gap-2 border border-transparent hover:border-gray-100"
                                    >
                                        <Edit className="w-4 h-4" /> Edit Details
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Hover Line */}
                            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-300"></div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <Calendar className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No events scheduled</h3>
                            <p className="text-gray-500 mb-8 max-w-sm">Create your first event to keep the community engaged and informed.</p>
                            <button
                                onClick={() => openModal()}
                                className="bg-white border border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Schedule Event
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                {currentEvent.id ? 'Edit Event' : 'Create New Event'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-medium bg-gray-50"
                                    value={currentEvent.title || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                    placeholder="e.g. Annual Conference 2025"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none bg-gray-50"
                                        value={currentEvent.start_date || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date (Opt)</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none bg-gray-50"
                                        value={currentEvent.end_date || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-medium bg-gray-50"
                                        value={currentEvent.location || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                        placeholder="e.g. Avari Hotel, Lahore"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all resize-none bg-gray-50"
                                    value={currentEvent.description || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                    placeholder="Event details, agenda, and important information..."
                                />
                            </div>

                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={currentEvent.is_featured || false}
                                            onChange={e => setCurrentEvent({ ...currentEvent, is_featured: e.target.checked })}
                                        />
                                        <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-accent transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Feature Event</span>
                                </label>

                                <div className="h-8 w-px bg-gray-200"></div>

                                <label className="flex items-center gap-3 flex-1">
                                    <span className="text-sm font-bold text-gray-700">Status:</span>
                                    <select
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-primary outline-none bg-white"
                                        value={currentEvent.status || 'upcoming'}
                                        onChange={e => setCurrentEvent({ ...currentEvent, status: e.target.value })}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="past">Past</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-primary-900 text-white rounded-xl hover:bg-primary-800 transition-all font-bold shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2 py-3"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" /> {currentEvent.id ? 'Save Changes' : 'Create Event'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
