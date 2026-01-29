"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, FileUp, Loader2 } from "lucide-react";
import { importUsersAction } from "@/app/actions/import-users";
import { toast } from "sonner";

export default function UserImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importUsersAction(formData);
            setResult(res);
            if (res.success > 0) {
                toast.success(`Successfully imported ${res.success} users!`);
            }
            if (res.failed > 0) {
                toast.warning(`Failed to import ${res.failed} rows.`);
            }
        } catch (error) {
            toast.error("Import failed unexpected error.");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/5 rounded-lg text-primary">
                    <FileUp className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Bulk User Import</h2>
                    <p className="text-sm text-gray-500">Upload an Excel (.xlsx) file to create users and profiles.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50/50 transition-colors relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />

                    {file ? (
                        <div className="flex flex-col items-center text-primary">
                            <CheckCircle className="w-10 h-10 mb-2" />
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <Upload className="w-10 h-10 mb-2" />
                            <p className="font-semibold text-gray-700">Click to Upload or Drag File</p>
                            <p className="text-xs">Supports .xlsx (Excel) files</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleImport}
                        disabled={!file || uploading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Importing Users...' : 'Start Import'}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in-up">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Import Summary</h3>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                <p className="text-2xl font-black text-emerald-600 mb-1">{result.success}</p>
                                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Imported</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                <p className="text-2xl font-black text-amber-600 mb-1">{result.skipped}</p>
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Skipped</p>
                            </div>
                            <div className={`p-4 rounded-xl border text-center ${result.failed > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                <p className={`text-2xl font-black mb-1 ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{result.failed}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${result.failed > 0 ? 'text-red-800' : 'text-gray-400'}`}>Failed</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        Error Log ({result.errors.length})
                                    </h4>
                                </div>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar p-0">
                                    {result.errors.map((err: string, i: number) => (
                                        <div key={i} className="px-4 py-2 text-xs font-mono text-red-600 border-b border-gray-100 last:border-0 hover:bg-red-50/50">
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">
                                Total Rows Processed: <span className="font-medium text-gray-600">{result.total}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
