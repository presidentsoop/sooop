"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, CheckCircle, Clock, Eye, Download, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface DocumentRecord {
    id: string;
    document_type: string;
    file_url: string;
    verified: boolean;
    created_at?: string;
    signedUrl?: string;
}

const DOC_LABELS: Record<string, { label: string; description: string }> = {
    'cnic_front': { label: 'CNIC Front', description: 'Front side of your Identity Card' },
    'cnic_back': { label: 'CNIC Back', description: 'Back side of your Identity Card' },
    'transcript_front': { label: 'Degree / Transcript', description: 'Latest educational qualification' },
    'profile_photo': { label: 'Profile Photo', description: 'Passport size photo' },
    'payment_proof': { label: 'Payment Receipt', description: 'Proof of membership fee payment' }
};

export default function DocumentManager({ userId }: { userId: string }) {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const fetchDocuments = async () => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (data) {
            // Get signed URLs for each document
            const docsWithUrls = await Promise.all(data.map(async (doc) => {
                if (doc.document_type === 'profile_photo') {
                    // Profile photos might be in a public bucket
                    return doc;
                }
                try {
                    const { data: signedData } = await supabase.storage
                        .from('documents')
                        .createSignedUrl(doc.file_url, 3600);
                    return {
                        ...doc,
                        signedUrl: signedData?.signedUrl || doc.file_url
                    };
                } catch {
                    return doc;
                }
            }));
            setDocuments(docsWithUrls);
        }
        setLoading(false);
    };

    const getDocInfo = (type: string) => DOC_LABELS[type] || { label: type.replace(/_/g, ' '), description: '' };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Your documents were uploaded during registration. If you need to update any documents,
                    please contact SOOOP administration.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-800 font-medium">Your Documents Are Secure</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Documents submitted during registration are stored securely and cannot be modified.
                        For any updates, contact the administration.
                    </p>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => {
                    const info = getDocInfo(doc.document_type);
                    return (
                        <div
                            key={doc.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{info.label}</h3>
                                    <p className="text-xs text-gray-500">{info.description}</p>
                                </div>
                                <div className={`p-2 rounded-full ${doc.verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {doc.verified ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                                {doc.signedUrl && doc.document_type !== 'profile_photo' ? (
                                    <div className="text-center p-4">
                                        <FileText className="w-12 h-12 text-primary-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500">Document Uploaded</p>
                                    </div>
                                ) : doc.document_type === 'profile_photo' && doc.file_url ? (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={doc.file_url.startsWith('http') ? doc.file_url : `/api/image?path=${doc.file_url}`}
                                            alt="Profile Photo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Preview unavailable</p>
                                    </div>
                                )}

                                {/* Verified Overlay */}
                                {doc.verified && (
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
                                            ✓ Verified
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Footer with Actions */}
                            <div className="p-4 bg-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    {doc.created_at && (
                                        <>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {doc.signedUrl && (
                                        <>
                                            <button
                                                onClick={() => setPreviewDoc(doc)}
                                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                title="View Document"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <a
                                                href={doc.signedUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            {previewDoc && previewDoc.signedUrl && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold">{getDocInfo(previewDoc.document_type).label}</h3>
                            <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={previewDoc.signedUrl}
                                alt="Document Preview"
                                className="max-w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
