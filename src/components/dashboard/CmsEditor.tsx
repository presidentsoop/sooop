"use client";

import { useState } from "react";
import { Save, RefreshCw, Type, Image as ImageIcon, Layout, Check, ChevronRight, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CmsEditorProps {
    pageId: string;
    initialContent: any;
    pageTitle: string;
}

export default function CmsEditor({ pageId, initialContent, pageTitle }: CmsEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

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
            toast.success("Page content updated successfully");
        } catch (error: any) {
            toast.error("Failed to save content");
        } finally {
            setSaving(false);
        }
    };

    // Recursive component to render JSON fields
    const renderFields = (data: any, path: string[] = []) => {
        if (typeof data === 'string' || typeof data === 'number') {
            return (
                <div className="flex-1">
                    <input
                        type="text"
                        value={data}
                        onChange={(e) => updateField(path, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                </div>
            );
        }

        if (typeof data === 'object' && data !== null) {
            return (
                <div className="space-y-4 w-full">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                            {/* Field Label / Header */}
                            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 bg-gray-200/50 rounded-md text-gray-500">
                                        {typeof value === 'object' ? <Layout className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className="font-semibold text-gray-700 capitalize text-sm tracking-wide">{key.replace(/_/g, ' ')}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {typeof value === 'object' ? 'Section' : 'Field'}
                                </span>
                            </div>

                            {/* Field Input / Recursion */}
                            <div className="p-4">
                                {renderFields(value, [...path, key])}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    const updateField = (path: string[], value: any) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let current = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setContent(newContent);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header Toolbar */}
            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-soft-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Layout className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">Editing Page Content</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setContent(initialContent)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Reset Changes"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-900 text-white rounded-xl font-semibold hover:bg-primary-800 transition-all shadow-lg shadow-primary-900/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6 pb-20">
                {renderFields(content)}
            </div>
        </div>
    );
}
