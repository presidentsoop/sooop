import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShieldAlert, User, MousePointer } from "lucide-react";

export default async function AuditLogsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Logs
    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    // Fetch Actor Names
    const userIds = Array.from(new Set((logs || []).map(l => l.performed_by).filter(Boolean)));
    let profiles: any[] = [];
    if (userIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        profiles = data || [];
    }

    const getName = (id: string) => profiles.find(p => p.id === id)?.full_name || id.slice(0, 8) + '...';

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
                <p className="text-gray-500 mt-2">Track all critical administrative actions and system events.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Performed By</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                                                <User className="w-3 h-3" />
                                            </div>
                                            <span className="font-medium text-gray-900">{getName(log.performed_by)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        {/* Render details as key-value tags if simple, or JSON block */}
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(log.details || {}).map(([k, v]: any) => (
                                                <span key={k} className="inline-flex text-[10px] items-center bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                    <span className="font-semibold mr-1 opacity-70">{k}:</span> {typeof v === 'object' ? '...' : String(v).slice(0, 20)}
                                                </span>
                                            ))}
                                            {(log.details && Object.keys(log.details).length === 0) && <span className="text-gray-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                        {log.ip_address || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No audit logs recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
