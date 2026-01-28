"use client";

import { useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Filter, MoreHorizontal } from "lucide-react";

// =====================================================
// PROFESSIONAL DATA TABLE COMPONENT
// Big Tech Style - Compact, Clean, Efficient
// =====================================================

interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (value: any, row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    onRowClick?: (row: T) => void;
    selectedRowId?: string | null;
    idKey?: keyof T;
    emptyMessage?: string;
    loading?: boolean;
    actions?: (row: T) => ReactNode;
    bulkActions?: ReactNode;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    pageSize = 20,
    searchable = true,
    searchPlaceholder = "Search...",
    searchKeys = [],
    onRowClick,
    selectedRowId,
    idKey = 'id' as keyof T,
    emptyMessage = "No data found",
    loading = false,
    actions,
    bulkActions,
    selectedIds,
    onSelectionChange,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filter data based on search
    const filteredData = data.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return searchKeys.some(key => {
            const value = row[key];
            return value && String(value).toLowerCase().includes(searchLower);
        });
    });

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === bVal) return 0;
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const toggleSelectAll = () => {
        if (!onSelectionChange) return;
        const allIds = paginatedData.map(row => String(row[idKey]));
        const allSelected = allIds.every(id => selectedIds?.has(id));
        if (allSelected) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(allIds));
        }
    };

    const toggleSelect = (id: string) => {
        if (!onSelectionChange || !selectedIds) return;
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        onSelectionChange(newSet);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            {(searchable || bulkActions) && (
                <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
                    {searchable && (
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    )}
                    {bulkActions && selectedIds && selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">{selectedIds.size} selected</span>
                            {bulkActions}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {onSelectionChange && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={paginatedData.length > 0 && paginatedData.every(row => selectedIds?.has(String(row[idKey])))}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''}`}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && sortKey === String(col.key) && (
                                            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="w-16 px-4 py-3"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-16 text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-500">
                                        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-16 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => {
                                const rowId = String(row[idKey]);
                                const isSelected = selectedRowId === rowId;
                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(row)}
                                        className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50/70'}`}
                                    >
                                        {onSelectionChange && (
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds?.has(rowId) || false}
                                                    onChange={() => toggleSelect(rowId)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => (
                                            <td
                                                key={String(col.key)}
                                                className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                            >
                                                {col.render
                                                    ? col.render(row[col.key as keyof T], row, index)
                                                    : String(row[col.key as keyof T] ?? '-')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                {actions(row)}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + pageSize, sortedData.length)}</span> of <span className="font-medium">{sortedData.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
