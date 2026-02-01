"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, User, Search, RefreshCw, Smartphone, Monitor, Globe } from "lucide-react";
import { format } from "date-fns";

type AuditLog = {
    id: string;
    action: string;
    performed_by: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
};

export default function AuditLogsClient() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [profiles, setProfiles] = useState<Record<string, string>>({});

    const supabase = createClient();

    const fetchLogs = async () => {
        setIsLoading(true);
        const { data: logData, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (logData) {
            setLogs(logData);

            // Fetch profiles for caching names
            const userIds = Array.from(new Set(logData.map(l => l.performed_by).filter(Boolean)));
            if (userIds.length > 0) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', userIds);

                if (profileData) {
                    const map: Record<string, string> = {};
                    profileData.forEach(p => map[p.id] = p.full_name);
                    setProfiles(map);
                }
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLogs();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('audit_logs_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
                const newLog = payload.new as AuditLog;
                setLogs(prev => [newLog, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getName = (id: string) => profiles[id] || "Unknown User";

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getName(log.performed_by).toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm)
    );

    const getDeviceIcon = (ua: string | null) => {
        if (!ua) return <Globe className="w-3 h-3" />;
        if (ua.toLowerCase().includes('mobile')) return <Smartphone className="w-3 h-3 text-purple-500" />;
        return <Monitor className="w-3 h-3 text-blue-500" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Audit Logs</h1>
                    <p className="text-gray-500 mt-2">Live tracking of administrative actions and security events.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        title="Refresh Logs"
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{format(new Date(log.created_at), 'MMM d, yyyy')}</span>
                                            <span className="text-xs text-gray-500 font-mono">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${log.action.includes('delete') ? 'bg-red-50 text-red-700 border-red-100' :
                                            log.action.includes('update') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                log.action.includes('create') || log.action.includes('approve') ? 'bg-green-50 text-green-700 border-green-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                {getName(log.performed_by).charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-xs">{getName(log.performed_by)}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tight">{log.performed_by.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-md">
                                            {Object.entries(log.details || {}).slice(0, 4).map(([k, v]: any) => (
                                                <div key={k} className="inline-flex text-[10px] items-center bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded shadow-sm">
                                                    <span className="font-bold mr-1 text-gray-400">{k}:</span>
                                                    <span className="font-mono">{typeof v === 'object' ? '...' : String(v).slice(0, 30)}</span>
                                                </div>
                                            ))}
                                            {log.details && Object.keys(log.details).length > 4 && (
                                                <span className="text-[10px] text-gray-400 flex items-center px-1">+{Object.keys(log.details).length - 4} more</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div title={log.ip_address} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                <Globe className="w-3 h-3 text-gray-400" />
                                                <span className="font-mono">{log.ip_address || 'Unknown IP'}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredLogs.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <ShieldAlert className="w-12 h-12 mb-3 text-gray-200" />
                                            <p className="font-medium">No audit logs found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
