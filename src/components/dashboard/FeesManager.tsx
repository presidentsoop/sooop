"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Coins, Loader2, X } from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";

type FeeStructure = {
    id: string;
    position: string;
    fee: string;
    sort_order: number;
};

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Nomination Fees</h2>
                    <p className="text-gray-500 text-sm">Manage election nomination fee structures.</p>
                </div>
                <button
                    onClick={() => { setCurrentFee({ sort_order: fees.length + 1 }); setIsModalOpen(true); }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Fee
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Sort</th>
                                <th className="p-4 font-bold">Position</th>
                                <th className="p-4 font-bold">Fee Amount</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fees.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 font-mono text-sm w-16 text-center">{item.sort_order}</td>
                                    <td className="p-4 font-bold text-gray-900">{item.position}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-green-100 text-green-700 p-1 rounded-full"><Coins className="w-3 h-3" /></div>
                                            <span className="font-medium text-gray-700">{item.fee}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setCurrentFee(item); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-400">
                                        No fee structures found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">{currentFee.id ? 'Edit' : 'Add'} Fee Structure</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Position / Title</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. President" value={currentFee.position || ''} onChange={e => setCurrentFee({ ...currentFee, position: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Fee Amount</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. 50,000 PKR" value={currentFee.fee || ''} onChange={e => setCurrentFee({ ...currentFee, fee: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Sort Order</label>
                                <input type="number" className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg outline-none" value={currentFee.sort_order || 0} onChange={e => setCurrentFee({ ...currentFee, sort_order: +e.target.value })} required />
                            </div>

                            <button type="submit" className="w-full btn btn-primary py-3 mt-4 shadow-lg shadow-primary/25">Save Fee</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
