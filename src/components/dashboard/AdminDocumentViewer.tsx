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

        if (data) setDocuments(data);
        setLoading(false);
    };

    const toggleVerify = async (doc: DocumentRecord) => {
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

    const getSignedUrl = async (doc: DocumentRecord) => {
        // Determine bucket based on type
        const bucket = doc.document_type === 'profile_photo' ? 'profile-photos' : 'documents';

        // Use logic appropriate for the bucket
        if (bucket === 'profile-photos') {
            const { data } = supabase.storage.from(bucket).getPublicUrl(doc.file_url);
            window.open(data.publicUrl, '_blank');
        } else {
            const { data } = await supabase.storage.from(bucket).createSignedUrl(doc.file_url, 3600);
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            } else {
                toast.error("Could not generate link");
            }
        }
    };

    if (loading) return <div className="py-4 text-center text-sm text-gray-400">Loading documents...</div>;

    if (documents.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">No documents uploaded by this member.</p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
                <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg ${doc.verified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 capitalize truncate">{doc.document_type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => getSignedUrl(doc)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                            title="View File"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toggleVerify(doc)}
                            className={`p-1.5 rounded-lg transition-colors ${doc.verified ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 hover:text-green-600 hover:bg-green-50'}`}
                            title={doc.verified ? "Revoke Verification" : "Mark Verified"}
                        >
                            <CheckCircle className={`w-4 h-4 ${doc.verified ? 'fill-green-100' : ''}`} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
