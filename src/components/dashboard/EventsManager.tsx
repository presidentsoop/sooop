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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
                    <p className="text-gray-500 text-sm">Create and manage upcoming conferences and meetings.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Event
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${event.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {event.status}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(event)}
                                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{event.title}</h3>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-accent" />
                                        {format(new Date(event.start_date), 'PPP p')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        {event.location}
                                    </div>
                                </div>

                                {event.is_featured && (
                                    <div className="text-xs font-semibold text-accent bg-accent/5 px-2 py-1 rounded-md inline-block">
                                        Featured Event
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                            <p className="text-gray-500 mb-6">Get started by creating your first event.</p>
                            <button onClick={() => openModal()} className="btn btn-outline">
                                Create Event
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {currentEvent.id ? 'Edit Event' : 'Create New Event'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={currentEvent.title || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                    placeholder="e.g. Annual Conference"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={currentEvent.start_date || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={currentEvent.end_date || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={currentEvent.location || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                    placeholder="e.g. Avari Hotel, Lahore"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    value={currentEvent.description || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                    placeholder="Event details..."
                                />
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                                        checked={currentEvent.is_featured || false}
                                        onChange={e => setCurrentEvent({ ...currentEvent, is_featured: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Featured Event</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <select
                                        className="px-2 py-1 rounded border border-gray-200 text-sm focus:border-primary outline-none"
                                        value={currentEvent.status || 'upcoming'}
                                        onChange={e => setCurrentEvent({ ...currentEvent, status: e.target.value })}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="past">Past</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-bold shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {currentEvent.id ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
