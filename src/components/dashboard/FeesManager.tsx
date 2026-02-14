"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Coins, Check, ArrowRight } from "lucide-react";
import { logAuditAction } from "@/app/actions/audit";
import DataTable from "@/components/ui/DataTable";
import Modal, { Button } from "@/components/ui/Modal";

interface FeeStructure {
    id: string;
    position: string;
    fee: string;
    sort_order: number;
}

export default function FeesManager() {
    const [fees, setFees] = useState<FeeStructure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentFee, setCurrentFee] = useState<Partial<FeeStructure> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = async () => {
        if (!currentFee) return;
        setIsSaving(true);
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
            // await logAuditAction(currentFee.id ? 'update_fee' : 'create_fee', payload);
            toast.success("Saved successfully");
            setCurrentFee(null);
            fetchFees();
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this fee structure?")) return;
        const { error } = await supabase.from('nomination_fees').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete");
        } else {
            // await logAuditAction('delete_fee', { id });
            toast.success("Deleted successfully");
            fetchFees();
        }
    };

    // History State Management
    useEffect(() => {
        if (currentFee) {
            window.history.pushState({ modal: 'fee-modal' }, '');

            const handlePopState = () => {
                setCurrentFee(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentFee]);

    const handleCloseModal = () => {
        if (window.history.state?.modal === 'fee-modal') {
            window.history.back();
        } else {
            setCurrentFee(null);
        }
    };

    // Mobile Row Renderer
    const renderMobileRow = (row: FeeStructure) => (
        <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-gray-400 text-xs bg-gray-50 px-1.5 py-0.5 rounded">#{row.sort_order}</span>
                    <p className="font-semibold text-gray-900">{row.position}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-sm">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{row.fee}</span>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); setCurrentFee(row); }}
                className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg transition-colors"
            >
                <Edit className="w-4 h-4" />
            </button>
        </div>
    );

    const columns = [
        {
            key: 'sort_order',
            header: '#',
            render: (val: number) => <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">#{val}</span>
        },
        {
            key: 'position',
            header: 'Position / Title',
            sortable: true,
            render: (val: string) => <div className="font-semibold text-gray-900">{val}</div>
        },
        {
            key: 'fee',
            header: 'Fee Amount',
            render: (val: string) => (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit font-bold text-sm border border-emerald-100">
                    {val}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nomination Fees</h1>
                    <p className="text-gray-500 mt-1">Manage election nomination fee structures</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setCurrentFee({ sort_order: fees.length + 1 })}
                    className="w-full sm:w-auto justify-center"
                >
                    Add Fee
                </Button>
            </div>

            <DataTable
                data={fees}
                columns={columns}
                loading={isLoading}
                emptyMessage="No fee structures configured."
                mobileRenderer={renderMobileRow}
                actions={(row) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentFee(row)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />

            <Modal
                isOpen={!!currentFee}
                onClose={handleCloseModal}
                title={currentFee?.id ? 'Edit Fee Structure' : 'Add Fee Structure'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={isSaving}
                            icon={currentFee?.id ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        >
                            {currentFee?.id ? 'Save Changes' : 'Create Fee'}
                        </Button>
                    </>
                }
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position / Title</label>
                        <input
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. President"
                            value={currentFee?.position || ''}
                            onChange={e => setCurrentFee(prev => prev ? { ...prev, position: e.target.value } : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                required
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                placeholder="e.g. 50,000 PKR"
                                value={currentFee?.fee || ''}
                                onChange={e => setCurrentFee(prev => prev ? { ...prev, fee: e.target.value } : null)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                        <input
                            type="number"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={currentFee?.sort_order || 0}
                            onChange={e => setCurrentFee(prev => prev ? { ...prev, sort_order: +e.target.value } : null)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
