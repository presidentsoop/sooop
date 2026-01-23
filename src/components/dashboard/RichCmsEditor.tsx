"use client";

import { useState } from "react";
import {
    Save, RefreshCw, Layout, Image as ImageIcon,
    Type, List, ChevronRight, Upload, X, Plus, Trash2,
    Monitor, Smartphone, Eye
} from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";
import { revalidateContent } from "@/app/actions/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface RichCmsEditorProps {
    pageId: string;
    initialContent: any;
    pageTitle: string;
}

export default function RichCmsEditor({ pageId, initialContent, pageTitle }: RichCmsEditorProps) {
    const [content, setContent] = useState(initialContent || {});
    const [activeSection, setActiveSection] = useState<string>(Object.keys(initialContent || {})[0] || 'hero');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null); // Key path being uploaded
    const supabase = createClient();

    // Helper to deeply update content
    const updateContent = (path: string[], value: any) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let current = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setContent(newContent);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('pages')
                .update({
                    content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', pageId);

            if (error) throw error;

            await revalidateContent('/', 'layout'); // Revalidate everything for safety, or specific path if known
            await logAuditAction('update_content', { pageId });

            toast.success("Changes published successfully");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string[]) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(path.join('.'));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${pageId}/${path.join('_')}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('cms-media')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('cms-media')
                .getPublicUrl(fileName);

            updateContent(path, publicUrl);
            toast.success("Image uploaded");
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        } finally {
            setUploading(null);
        }
    };

    // Recursive Field Renderer
    const renderField = (key: string, value: any, path: string[]) => {
        const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('icon');
        const isLongText = typeof value === 'string' && (value.length > 60 || key.includes('description') || key.includes('bio'));

        // 1. Array Handling (List)
        if (Array.isArray(value)) {
            return (
                <div key={key} className="col-span-full bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-700 capitalize flex items-center gap-2">
                            <List className="w-4 h-4 text-purple-500" />
                            {key} <span className="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{value.length} Items</span>
                        </h4>
                    </div>

                    <div className="grid gap-4">
                        {value.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    {/* Simple Delete (Advanced would be Remove from Array) */}
                                    {/* Note: Array modification requires robust Splice logic. Omitting for MVP robustness. Edit In-Place supported. */}
                                </div>
                                <div className="space-y-4">
                                    {/* Render Object Fields */}
                                    {Object.entries(item).map(([subKey, subVal]) =>
                                        renderField(subKey, subVal, [...path, idx.toString(), subKey])
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Object Handling (Group)
        if (typeof value === 'object' && value !== null) {
            return (
                <div key={key} className="col-span-full space-y-4 mt-4">
                    <h4 className="font-bold text-gray-900 capitalize border-b pb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4" /> {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(value).map(([subKey, subVal]) =>
                            renderField(subKey, subVal, [...path, subKey])
                        )}
                    </div>
                </div>
            );
        }

        // 3. Image Handling
        if (isImage && typeof value === 'string') {
            return (
                <div key={key} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</label>
                    <div className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0">
                            {value ? (
                                value.startsWith('http') ? (
                                    <Image src={value} alt={key} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Invalid URL</div>
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-6 h-6" /></div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => updateContent(path, e.target.value)}
                                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-md"
                                placeholder="Image URL..."
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload(e, path)}
                                    className="hidden"
                                    id={`upload-${path.join('-')}`}
                                    accept="image/*"
                                />
                                <label
                                    htmlFor={`upload-${path.join('-')}`}
                                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition"
                                >
                                    {uploading === path.join('.') ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                    Upload New Image
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 4. Text Handling
        return (
            <div key={key} className={isLongText ? "col-span-full" : ""}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    {key.replace(/_/g, ' ')}
                </label>
                {isLongText ? (
                    <textarea
                        value={value}
                        onChange={(e) => updateContent(path, e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all min-h-[100px]"
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateContent(path, e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left Sidebar - Navigation */}
            <div className="w-64 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Page Sections</h3>
                    <p className="text-xs text-gray-500">Select a section to edit</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Sort Keys based on logical order */}
                    {Object.keys(content).sort((a, b) => {
                        const order = ['hero', 'stats', 'about', 'benefits', 'features', 'sponsors', 'leadership', 'resources', 'testimonials', 'faq', 'cta'];
                        const idxA = order.indexOf(a.toLowerCase());
                        const idxB = order.indexOf(b.toLowerCase());
                        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                    }).map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeSection === key
                                ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            {activeSection === key && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Editor Header */}
                <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Layout className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="font-bold text-gray-900 capitalize">{activeSection.replace(/_/g, ' ')}</h2>
                            <p className="text-xs text-gray-500">{pageTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Preview">
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gray-900/10"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Publishing...' : 'Publish Changes'}
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {content[activeSection] ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {Object.entries(content[activeSection]).map(([key, value]) =>
                                    renderField(key, value, [activeSection, key])
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                This section is empty.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
