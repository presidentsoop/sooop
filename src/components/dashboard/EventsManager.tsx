"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, MapPin, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button, StatusBadge } from "@/components/ui/Modal";

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
    const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);
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

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentEvent) return;

        setIsSaving(true);
        const eventData = {
            title: currentEvent.title,
            start_date: currentEvent.start_date,
            end_date: currentEvent.end_date || null,
            location: currentEvent.location,
            description: currentEvent.description,
            is_featured: currentEvent.is_featured || false,
            status: currentEvent.status || 'upcoming'
        };

        if (currentEvent.id) {
            const { error } = await supabase.from("events").update(eventData).eq("id", currentEvent.id);
            if (error) toast.error("Failed to update event");
            else {
                toast.success("Event updated");
                setCurrentEvent(null);
                fetchEvents();
            }
        } else {
            const { error } = await supabase.from("events").insert([eventData]);
            if (error) toast.error("Failed to create event");
            else {
                toast.success("Event created");
                setCurrentEvent(null);
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
        } : { status: 'upcoming', is_featured: false, title: '', location: '', description: '' });
    };

    // History State Management
    useEffect(() => {
        if (currentEvent) {
            window.history.pushState({ modal: 'event-modal' }, '');

            const handlePopState = () => {
                setCurrentEvent(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentEvent]);

    const handleCloseModal = () => {
        if (window.history.state?.modal === 'event-modal') {
            window.history.back();
        } else {
            setCurrentEvent(null);
        }
    };

    // Mobile Row Renderer
    const renderMobileRow = (row: Event) => (
        <div className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{row.title}</h3>
                    {row.is_featured && (
                        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                            Featured
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(row.start_date), 'MMM d, yyyy')}</span>
                    <span className="text-gray-300">|</span>
                    <StatusBadge status={row.status} size="sm" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{row.location}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); openModal(row); }}
                    className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg transition-colors"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const columns = [
        {
            key: 'title',
            header: 'Event Name',
            sortable: true,
            render: (val: string, row: Event) => (
                <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{val}</p>
                    {row.is_featured && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Featured
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: string) => <StatusBadge status={val} />
        },
        {
            key: 'start_date',
            header: 'Date & Time',
            sortable: true,
            render: (val: string, row: Event) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {format(new Date(val), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {format(new Date(val), 'h:mm a')}
                    </div>
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location',
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {val}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
                    <p className="text-gray-500 mt-1">Schedule and manage conferences and meetings</p>
                </div>
                <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => openModal()} className="w-full sm:w-auto justify-center">
                    Create Event
                </Button>
            </div>

            <DataTable
                data={events}
                columns={columns}
                loading={isLoading}
                searchable
                searchKeys={['title', 'location']}
                searchPlaceholder="Search events..."
                mobileRenderer={renderMobileRow}
                actions={(row) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openModal(row)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />

            <Modal
                isOpen={!!currentEvent}
                onClose={handleCloseModal}
                title={currentEvent?.id ? 'Edit Event' : 'Create New Event'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={() => handleSave()}
                            loading={isSaving}
                            icon={currentEvent?.id ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        >
                            {currentEvent?.id ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </>
                }
            >
                <div className="p-4 md:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={currentEvent?.title || ''}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                            placeholder="e.g. Annual Conference 2025"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={currentEvent?.start_date || ''}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={currentEvent?.end_date || ''}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, end_date: e.target.value } : null)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={currentEvent?.location || ''}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                                placeholder="e.g. Avari Hotel, Lahore"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                            value={currentEvent?.description || ''}
                            onChange={e => setCurrentEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="Event details..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <input
                                type="checkbox"
                                id="is_featured"
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                checked={currentEvent?.is_featured || false}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, is_featured: e.target.checked } : null)}
                            />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer">Feature Event</label>
                        </div>

                        <div>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                value={currentEvent?.status || 'upcoming'}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, status: e.target.value } : null)}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
