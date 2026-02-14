"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Check, Eye } from "lucide-react";
import { Button } from "./Modal";

// =====================================================
// PROFESSIONAL IMAGE VIEWER & DOCUMENT PREVIEW
// Big Tech Style - Clean Lightbox with Actions
// =====================================================

interface ImageViewerProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    title?: string;
    onVerify?: () => void;
    isVerified?: boolean;
}

export function ImageViewer({
    isOpen,
    onClose,
    src,
    title,
    onVerify,
    isVerified,
}: ImageViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setZoom(1);
            setRotation(0);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col animate-fade-in touch-none">
            {/* Header - Optimized for Mobile */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        {title && <h3 className="text-white font-medium truncate text-sm md:text-base">{title}</h3>}
                        {isVerified !== undefined && (
                            <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-medium ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                <Check className="w-3 h-3" />
                                {isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Desktop Toolbar */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-white/70 text-sm font-mono w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <button
                        onClick={() => setRotation(r => r + 90)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Rotate"
                    >
                        <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => window.open(src, '_blank')}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Right Actions */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={() => window.open(src, '_blank')}
                        className="p-2 text-white/70 hover:text-white active:bg-white/10 rounded-full transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-hidden relative w-full h-full bg-black/90">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                        src={src}
                        alt={title || "Document"}
                        className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out select-none"
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        }}
                        draggable={false}
                    />
                </div>
            </div>

            {/* Mobile Bottom Toolbar */}
            <div className="md:hidden flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 mb-safe">
                <button
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                    className="p-3 text-white/80 active:text-white active:bg-white/10 rounded-full"
                >
                    <ZoomOut className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setRotation(r => r + 90)}
                    className="p-3 text-white/80 active:text-white active:bg-white/10 rounded-full"
                >
                    <RotateCw className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                    className="p-3 text-white/80 active:text-white active:bg-white/10 rounded-full"
                >
                    <ZoomIn className="w-6 h-6" />
                </button>
            </div>

            {/* Footer Verify Action */}
            {onVerify && (
                <div className="flex items-center justify-center gap-4 px-4 py-4 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 z-10 pb-safe">
                    <Button
                        variant={isVerified ? 'secondary' : 'success'}
                        onClick={onVerify}
                        icon={<Check className="w-4 h-4" />}
                        className="w-full md:w-auto"
                    >
                        {isVerified ? 'Mark as Unverified' : 'Verify Document'}
                    </Button>
                </div>
            )}
        </div>
    );
}

// =====================================================
// DOCUMENT THUMBNAIL GRID
// =====================================================

export interface DocumentItem {
    id: string;
    document_type: string;
    file_url: string;
    signedUrl?: string;
    verified?: boolean;
    created_at: string;
}

interface DocumentGridProps {
    documents: DocumentItem[];
    onVerify?: (doc: DocumentItem) => void;
    highlightType?: string; // e.g., "transaction_slip" to highlight
}

export function DocumentGrid({ documents, onVerify, highlightType }: DocumentGridProps) {
    const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);

    // History API for Image Viewer
    useEffect(() => {
        if (viewingDoc) {
            window.history.pushState({ modal: 'image-viewer' }, '');

            const handlePopState = () => {
                setViewingDoc(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [viewingDoc]);

    const handleCloseViewer = () => {
        if (window.history.state?.modal === 'image-viewer') {
            window.history.back();
        } else {
            setViewingDoc(null);
        }
    };

    const formatDocType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const isImage = (url: string) => {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'].some(ext => url.toLowerCase().includes(ext));
    };

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No documents uploaded
            </div>
        );
    }

    // Sort to show highlighted type first
    const sortedDocs = highlightType
        ? [...documents].sort((a, b) => {
            if (a.document_type === highlightType) return -1;
            if (b.document_type === highlightType) return 1;
            return 0;
        })
        : documents;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedDocs.map((doc) => {
                    const url = doc.signedUrl || doc.file_url;
                    const isHighlighted = doc.document_type === highlightType;

                    return (
                        <div
                            key={doc.id}
                            onClick={() => setViewingDoc(doc)}
                            className={`group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg ${isHighlighted ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-gray-300'}`}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] relative">
                                {isImage(url) ? (
                                    <img
                                        src={url}
                                        alt={doc.document_type}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <span className="text-3xl">📄</span>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>

                                {/* Verified badge */}
                                {doc.verified && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}

                                {/* Highlight badge */}
                                {isHighlighted && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">
                                        Review
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="px-2 py-2 bg-white">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                    {formatDocType(doc.document_type)}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Image Viewer Modal */}
            {viewingDoc && (
                <ImageViewer
                    isOpen={!!viewingDoc}
                    onClose={handleCloseViewer}
                    src={viewingDoc.signedUrl || viewingDoc.file_url}
                    title={formatDocType(viewingDoc.document_type)}
                    isVerified={viewingDoc.verified}
                    onVerify={onVerify ? () => { onVerify(viewingDoc); handleCloseViewer(); } : undefined}
                />
            )}
        </>
    );
}
