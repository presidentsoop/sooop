"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Check, Eye, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DocumentGrid } from "@/components/ui/ImageViewer";

interface DocumentRecord {
    id: string;
    document_type: string;
    file_url: string;
    verified: boolean;
    created_at: string;
    signedUrl?: string;
}

export default function AdminDocumentViewer({ userId }: { userId: string }) {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        setLoading(true);
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
                return { ...doc, signedUrl: url };
            }));
            setDocuments(signedDocs);
        }
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

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No documents uploaded</p>
                <p className="text-gray-400 text-sm mt-1">This member hasn't uploaded any documents yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Documents ({documents.length})
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Verified
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                        Unverified
                    </span>
                </div>
            </div>

            <DocumentGrid
                documents={documents}
                onVerify={toggleVerify}
                highlightType="transaction_slip"
            />
        </div>
    );
}
