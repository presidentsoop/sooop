"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Coins, Loader2, X } from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";

interface FeeStructure {
    id: string;
    position: string;
    fee: string;
    sort_order: number;
}

export default function FeesManager() {
    const [fees, setFees] = useState<FeeStructure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFee, setCurrentFee] = useState<Partial<FeeStructure>>({});

    const supabase = createClient();

    const fetchFees = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('nomination_fees').select('*').order('sort_order', { ascending: true });
        if (error) {
            toast.error("Failed to load fees");
        } else {
            setFees(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            position: currentFee.position,
            fee: currentFee.fee,
            sort_order: currentFee.sort_order || 0
        };

        const { error } = currentFee.id
            ? await supabase.from('nomination_fees').update(payload).eq('id', currentFee.id)
            : await supabase.from('nomination_fees').insert([payload]);

        if (error) {
            toast.error("Failed to save");
        } else {
            await logAuditAction(currentFee.id ? 'update_fee' : 'create_fee', payload);
            toast.success("Saved successfully");
            setIsModalOpen(false);
            fetchFees();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this fee structure?")) return;
        const { error } = await supabase.from('nomination_fees').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete");
        } else {
            await logAuditAction('delete_fee', { id });
            toast.success("Deleted successfully");
            fetchFees();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nomination Fees</h1>
                    <p className="text-gray-500 mt-2">Manage fee structures for election nominations.</p>
                </div>
                <button
                    onClick={() => { setCurrentFee({ sort_order: fees.length + 1 }); setIsModalOpen(true); }}
                    className="bg-primary-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-1 transition-all flex items-center gap-2 font-semibold"
                >
                    <Plus className="w-5 h-5" /> Add New Fee
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fees.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-50 shadow-sm">
                                    <Coins className="w-6 h-6 text-primary" />
                                </div>
                                <div className="bg-gray-50 text-gray-400 font-mono text-xs px-2 py-1 rounded-md border border-gray-100">
                                    #{item.sort_order}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{item.position}</h3>
                            <p className="text-sm text-gray-500 mb-6">Required Fee</p>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</span>
                                <span className="text-2xl font-bold text-primary-900 tracking-tight">{item.fee}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => { setCurrentFee(item); setIsModalOpen(true); }}
                                    className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <div className="w-px h-4 bg-gray-200"></div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>

                            {/* Decorative gradient on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {fees.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Coins className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Fees Configured</h3>
                            <p className="text-gray-500 mt-1 mb-6">Set up the first nomination fee structure.</p>
                            <button
                                onClick={() => { setCurrentFee({ sort_order: fees.length + 1 }); setIsModalOpen(true); }}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Setup Fees
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-xl text-gray-900">{currentFee.id ? 'Edit' : 'Add'} Fee Structure</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Position / Title</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="e.g. President"
                                        value={currentFee.position || ''}
                                        onChange={e => setCurrentFee({ ...currentFee, position: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Fee Amount</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            className="w-full pl-10 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-900"
                                            placeholder="e.g. 50,000 PKR"
                                            value={currentFee.fee || ''}
                                            onChange={e => setCurrentFee({ ...currentFee, fee: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-primary transition-colors"
                                        value={currentFee.sort_order || 0}
                                        onChange={e => setCurrentFee({ ...currentFee, sort_order: +e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-0.5 transition-all">
                                    {currentFee.id ? 'Save Changes' : 'Create Fee Structure'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
