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

    return (
        <DashboardLayout userRole="admin" userName="Admin" userEmail={user?.email}>
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
                                <th className="px-6 py-4">Admin / User</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-xs">{log.performed_by?.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate">
                                        {JSON.stringify(log.details)}
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
        </DashboardLayout>
    );
}
