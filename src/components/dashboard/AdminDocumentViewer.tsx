"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, CheckCircle, ExternalLink, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

interface DocumentRecord {
    id: string;
    document_type: string;
    file_url: string;
    verified: boolean;
    created_at: string;
}

export default function AdminDocumentViewer({ userId }: { userId: string }) {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('document_type');

        if (data) {
            const signedDocs = await Promise.all(data.map(async (doc) => {
                let url = doc.file_url;
                if (doc.document_type !== 'profile_photo' && !url.startsWith('http')) {
                    const { data: signed } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 3600);
                    if (signed?.signedUrl) url = signed.signedUrl;
                }
                // Profile photos usually public path, but if just path, need publicUrl?
                // Usually profile photos stored as full URL or public bucket.
                return { ...doc, signedUrl: url };
            }));
            setDocuments(signedDocs);
        }
        setLoading(false);
    };

    const toggleVerify = async (doc: any) => {
        const newStatus = !doc.verified;
        const { error } = await supabase
            .from('documents')
            .update({ verified: newStatus, verified_at: newStatus ? new Date().toISOString() : null })
            .eq('id', doc.id);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(newStatus ? "Document Verified" : "Verification Revoked");
            setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, verified: newStatus } : d));
        }
    };

    if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    if (documents.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">No documents uploaded by this member.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {documents.map((doc: any) => (
                <div key={doc.id} className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => window.open(doc.signedUrl, '_blank')}>
                    {/* Preview Area */}
                    <div className="aspect-video bg-gray-100 relative items-center justify-center flex">
                        {['jpg', 'jpeg', 'png', 'webp'].some(ext => doc.file_url.toLowerCase().includes(ext)) ? (
                            <img src={doc.signedUrl} alt={doc.document_type} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <FileText className="w-8 h-8" />
                                <span className="text-[10px] font-bold uppercase">FILE</span>
                            </div>
                        )}

                        {/* Overlay with Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleVerify(doc); }}
                                className={`p-2 rounded-full backdrop-blur-md transition-colors ${doc.verified ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-green-500'}`}
                                title={doc.verified ? "Verified" : "Mark Verified"}
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(doc.signedUrl, '_blank'); }}
                                className="p-2 bg-white/20 hover:bg-white text-white hover:text-primary rounded-full backdrop-blur-md transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-3 bg-white border-t border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-900 capitalize truncate max-w-[100px]">{doc.document_type.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        {doc.verified && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                                <CheckCircle className="w-3 h-3" /> Verified
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
