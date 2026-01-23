import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChevronLeft, DollarSign, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function PaymentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Fetch Profile for Subscription Dates
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, subscription_end_date, membership_status')
        .eq('id', user.id)
        .single();

    // Fetch Payments History
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Calculate Stats
    const totalSpent = payments?.reduce((sum, p) => p.status === 'verified' ? sum + Number(p.amount) : sum, 0) || 0;
    const totalYearsPaid = payments?.filter(p => p.status === 'verified').length || 0;

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Verified</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
        }
    };

    return (
        <DashboardLayout
            userRole="member"
            userName={profile?.full_name}
            userEmail={user?.email}
        >
            <div className="max-w-5xl mx-auto py-8 animate-fade-in">
                <div className="mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium mb-4">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Membership Fees & History</h1>
                    <p className="text-gray-500">Track your subscription payments and download receipts.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase">Total Paid</p>
                                <h3 className="text-2xl font-bold text-gray-900">PKR {totalSpent.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase">Years Subscribed</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalYearsPaid} Years</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
                        <p className="text-gray-400 text-sm font-medium mb-1">Next Payment Due</p>
                        <h3 className="text-2xl font-bold">
                            {profile?.subscription_end_date
                                ? new Date(profile.subscription_end_date).toLocaleDateString()
                                : 'Membership Inactive'}
                        </h3>
                        {profile?.membership_status === 'approved' && (
                            <p className="text-xs text-green-400 mt-2 font-medium">● Membership Active</p>
                        )}
                    </div>
                </div>

                {/* Payment History Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
                    </div>

                    {payments && payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Method / Trx ID</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                Membership Fee <br />
                                                <span className="text-xs text-gray-400">
                                                    {payment.period_start ? `${new Date(payment.period_start).getFullYear()}-${new Date(payment.period_end).getFullYear()}` : 'One-time'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{payment.payment_mode}</div>
                                                <div className="font-mono text-xs text-gray-400">{payment.transaction_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(payment.status)}
                                                {payment.rejection_reason && (
                                                    <p className="text-xs text-red-500 mt-1 max-w-[150px]">{payment.rejection_reason}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                PKR {Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {payment.receipt_url ? (
                                                    <a
                                                        href={payment.receipt_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:text-primary-700 text-xs font-bold underline"
                                                    >
                                                        View Slip
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <p>No payment history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
