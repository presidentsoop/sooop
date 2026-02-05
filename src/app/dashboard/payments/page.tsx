import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, CreditCard, Shield, Receipt } from "lucide-react";
import Link from "next/link";

// Fee structure based on membership type
const MEMBERSHIP_FEES: Record<string, number> = {
    'student': 500,
    'professional': 2000,
    'associate': 1500,
    'fellow': 5000,
    'life': 20000,
    'default': 2000
};

export default async function PaymentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch Payments History
    const { data: paymentsRaw } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Generate Signed URLs for receipts
    const payments = await Promise.all((paymentsRaw || []).map(async (p) => {
        if (p.receipt_url && !p.receipt_url.startsWith('http')) {
            try {
                const { data } = await supabase.storage.from('documents').createSignedUrl(p.receipt_url, 3600);
                if (data?.signedUrl) {
                    return { ...p, receipt_url: data.signedUrl };
                }
            } catch (e) {
                console.error("Error signing url", e);
            }
        }
        return p;
    }));

    // Calculate Stats
    const totalSpent = payments?.reduce((sum, p) => p.status === 'verified' ? sum + Number(p.amount) : sum, 0) || 0;
    const totalYearsPaid = payments?.filter(p => p.status === 'verified').length || 0;

    // Get applicable fee based on membership type
    const applicableFee = MEMBERSHIP_FEES[profile?.membership_type?.toLowerCase() || 'default'] || MEMBERSHIP_FEES.default;

    // Calculate if membership is active and subscription info
    const isActive = profile?.membership_status === 'active';
    const subscriptionEndDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const subscriptionStartDate = profile?.subscription_start_date ? new Date(profile.subscription_start_date) : null;
    const isExpired = subscriptionEndDate && subscriptionEndDate < new Date();

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Verified</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Membership Fees & History</h1>
                <p className="text-gray-500">Track your subscription payments and membership status.</p>
            </div>

            {/* Subscription Status Card */}
            {isActive && subscriptionEndDate && (
                <div className={`mb-8 p-6 rounded-2xl border-2 ${isExpired ? 'bg-red-50 border-red-200' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                <Shield className={`w-7 h-7 ${isExpired ? 'text-red-600' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isExpired ? 'text-red-800' : 'text-emerald-800'}`}>
                                    {isExpired ? 'Subscription Expired' : 'Active Membership'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {profile?.membership_type ? profile.membership_type.charAt(0).toUpperCase() + profile.membership_type.slice(1) : 'Standard'} Member
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Registration Number</p>
                            <p className="font-mono font-bold text-gray-900">{profile?.registration_number || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-200/50">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Started</p>
                            <p className="text-sm font-bold text-gray-900">
                                {subscriptionStartDate ? subscriptionStartDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Expires</p>
                            <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                {subscriptionEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Annual Fee</p>
                            <p className="text-sm font-bold text-gray-900">PKR {applicableFee.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Designation</p>
                            <p className="text-sm font-bold text-gray-900">{profile?.designation || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase">Total Paid</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                PKR {totalSpent > 0 ? totalSpent.toLocaleString() : applicableFee.toLocaleString()}
                            </h3>
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
                            <h3 className="text-2xl font-bold text-gray-900">
                                {totalYearsPaid > 0 ? totalYearsPaid : (isActive ? 1 : 0)} Year{totalYearsPaid !== 1 ? 's' : ''}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
                    <p className="text-gray-400 text-sm font-medium mb-1">Next Payment Due</p>
                    <h3 className="text-2xl font-bold">
                        {subscriptionEndDate
                            ? subscriptionEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Membership Inactive'}
                    </h3>
                    {isActive && !isExpired && (
                        <p className="text-xs text-green-400 mt-2 font-medium">● Membership Active</p>
                    )}
                    {isExpired && (
                        <p className="text-xs text-red-400 mt-2 font-medium">● Renewal Required</p>
                    )}
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
                        <p className="text-sm text-gray-500">Your payment records and receipts</p>
                    </div>
                    <Receipt className="w-5 h-5 text-gray-400" />
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
                                            {new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">Annual Membership Fee</div>
                                            <span className="text-xs text-gray-400">
                                                {payment.period_start && payment.period_end
                                                    ? `${new Date(payment.period_start).getFullYear()}-${new Date(payment.period_end).getFullYear()}`
                                                    : `${profile?.membership_type || 'Standard'} Membership`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{payment.payment_mode || 'Manual'}</div>
                                            <div className="font-mono text-xs text-gray-400">{payment.transaction_id || 'N/A'}</div>
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
                    <div className="p-12 text-center">
                        {isActive ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Membership Active</h3>
                                <p className="text-gray-500 text-sm max-w-md mx-auto">
                                    Your membership fee of <strong>PKR {applicableFee.toLocaleString()}</strong> has been processed.
                                    Payment records will appear here once verified by the administration.
                                </p>
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400">No payment history found.</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Submit your membership fee to activate your subscription.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
