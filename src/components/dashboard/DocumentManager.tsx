"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, CheckCircle, XCircle, Clock, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface DocumentRecord {
    id: string;
    document_type: string;
    file_url: string;
    verified: boolean;
    created_at?: string;
    status?: string; // Derived or future field
}

const REQUIRED_DOCS = [
    { type: 'cnic_front', label: 'CNIC Front', description: 'Front side of your Identity Card' },
    { type: 'cnic_back', label: 'CNIC Back', description: 'Back side of your Identity Card' },
    { type: 'transcript_front', label: 'Degree / Transcript', description: 'Latest educational qualification' },
    { type: 'profile_photo', label: 'Profile Photo', description: 'Passport size blue background' },
    { type: 'payment_proof', label: 'Payment Receipt', description: 'Proof of membership fee payment' }
];

export default function DocumentManager({ userId }: { userId: string }) {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (data) setDocuments(data);
        setLoading(false);
    };

    const handleUpload = async (type: string, file: File) => {
        try {
            setUploading(type);
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

            // 1. Upload to Storage
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('documents')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public/Private URL
            // Documents bucket is private, so we use signed url for viewing, but for records we store the path
            // Actually, let's store the Full Path or signed ID. 
            // For simplicity in this app, we might need a public bucket for simple viewing or signed URLs.
            // The bucket config said 'documents' is public: false.
            // So we store the path.

            const filePath = uploadData.path;

            // 3. Upsert into Database (Replace old doc of same type or add new)
            // Strategy: Insert new record. If one exists for this type, maybe archive it?
            // For now, let's just Insert.

            // Check if exists
            const existing = documents.find(d => d.document_type === type);

            const { error: dbError } = await supabase
                .from('documents')
                .upsert({
                    user_id: userId,
                    document_type: type,
                    file_url: filePath,
                    verified: false, // Reset verification on new upload
                    uploaded_at: new Date().toISOString()
                }, { onConflict: 'id' as any }); // This is tricky if we don't have unique constraint on type+user.
            // If schema doesn't have unique constraint on (user_id, document_type), we might duplicate.
            // Let's just insert for now and handle "Latest" in UI.
            // Actually, let's Delete old then Insert new to be clean.

            if (existing) {
                await supabase.from('documents').delete().eq('id', existing.id);
            }

            await supabase.from('documents').insert({
                user_id: userId,
                document_type: type,
                file_url: filePath,
                verified: false
            });

            toast.success(`${type.replace('_', ' ')} uploaded successfully`);
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
        } finally {
            setUploading(null);
        }
    };

    const getDocStatus = (type: string) => {
        const doc = documents.find(d => d.document_type === type);
        if (!doc) return 'missing';
        if (doc.verified) return 'approved';
        return 'pending';
    };

    const getDoc = (type: string) => documents.find(d => d.document_type === type);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading documents...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {REQUIRED_DOCS.map((req) => {
                const status = getDocStatus(req.type);
                const doc = getDoc(req.type);

                return (
                    <div key={req.type} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 flex flex-col h-full relative group hover:shadow-lg transition-all">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-primary-900">{req.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                            </div>
                            <div className={`
                                p-2 rounded-full 
                                ${status === 'approved' ? 'bg-green-100 text-green-600' :
                                    status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-gray-100 text-gray-400'}
                            `}>
                                {status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                    status === 'pending' ? <Clock className="w-5 h-5" /> :
                                        <FileText className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* Preview / Placeholder */}
                        <div className={`
                            flex-1 min-h-[160px] rounded-xl border-2 border-dashed border-gray-200 
                            flex items-center justify-center bg-gray-50/50 relative overflow-hidden
                            ${!doc ? 'hover:bg-gray-50 hover:border-primary/30' : ''}
                            transition-colors
                        `}>
                            {doc ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                    <FileText className="w-12 h-12 text-primary-300 mb-2" />
                                    <p className="text-xs text-center text-gray-600 truncate max-w-full px-2">File Uploaded</p>
                                    <p className="text-[10px] text-gray-400">{new Date(doc.created_at || Date.now()).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No document uploaded</p>
                                </div>
                            )}

                            {/* Verification Overlay */}
                            {status === 'approved' && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Action Area */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            {status !== 'approved' && (
                                <div className="relative">
                                    <input
                                        type="file"
                                        id={`upload-${req.type}`}
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(req.type, file);
                                        }}
                                        disabled={uploading === req.type}
                                    />
                                    <label
                                        htmlFor={`upload-${req.type}`}
                                        className={`
                                            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all
                                            ${uploading === req.type
                                                ? 'bg-gray-100 text-gray-400 cursor-wait'
                                                : 'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:-translate-y-0.5 active:translate-y-0'}
                                        `}
                                    >
                                        {uploading === req.type ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                {doc ? 'Replace File' : 'Upload File'}
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}

                            {status === 'approved' && (
                                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-400 cursor-not-allowed">
                                    <CheckCircle className="w-4 h-4" />
                                    Verified & Locked
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
