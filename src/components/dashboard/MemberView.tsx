"use client";

import Link from "next/link";
import { User, FileText, CreditCard, AlertCircle, CheckCircle, Lock, DollarSign, Clock, ArrowRight, ShieldCheck, Download } from "lucide-react";
import MembershipForm from "@/components/auth/MembershipForm";

interface MemberViewProps {
    status: string; // 'none' | 'pending' | 'approved' | 'rejected'
    profile?: any;
}

export default function MemberView({ status, profile }: MemberViewProps) {
    // --------------------------------------------------------------------------
    // STATE: NO MEMBERSHIP (ONBOARDING) OR REJECTED
    // --------------------------------------------------------------------------
    if (status === 'none' || !status || status === 'rejected') {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {status === 'rejected' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                            <div>
                                <h3 className="font-bold text-red-800">Application Returned</h3>
                                <p className="text-sm text-red-700">Your previous application was returned/rejected. Please update your details and submit again.</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Onboarding Header */}
                <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl font-heading font-bold mb-4">Complete Your Application</h1>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Welcome to the Society of Optometrists Pakistan. To gain full access to member benefits, verified status, and your digital ID card, please complete your profile below.
                        </p>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute right-20 bottom-0 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl translate-y-1/2"></div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-soft-xl border border-gray-100/60 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Application Form
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Fields marked with <span className="text-red-500">*</span> are required.</p>
                        </div>
                        <div className="hidden md:block">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Step 1 of 2</span>
                        </div>
                    </div>
                    <div className="p-8">
                        <MembershipForm />
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // STATE: PENDING REVIEW
    // --------------------------------------------------------------------------
    if (status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto py-12 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-soft-xl border border-gray-100 p-12 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>

                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                        <div className="absolute inset-0 rounded-full border-4 border-yellow-100 border-t-yellow-400 animate-spin"></div>
                        <Clock className="w-10 h-10 text-yellow-600 relative z-10" />
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Under Review</h1>
                    <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl mx-auto">
                        Thank you for submitting your application. Our team is currently verifying your documents. This process usually takes <span className="font-semibold text-gray-900">24-48 hours</span>.
                    </p>

                    {/* Steps Visualizer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto border-t border-gray-100 pt-10">
                        <div className="flex items-start gap-4 opacity-50">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Submission</h4>
                                <p className="text-xs text-gray-500 mt-1">Application received</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 relative">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm shrink-0 shadow-sm ring-4 ring-yellow-50">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Verification</h4>
                                <p className="text-xs text-gray-500 mt-1">In Progress...</p>
                            </div>
                            {/* Connector Line */}
                            <div className="hidden md:block absolute -left-6 top-4 w-4 h-0.5 bg-gray-200"></div>
                        </div>

                        <div className="flex items-start gap-4 opacity-40 grayscale">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shrink-0 border border-gray-200">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Wait for Approval</h4>
                                <p className="text-xs text-gray-500 mt-1">Final step</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8">
                    Need help? <a href="mailto:support@soopvision.com" className="text-primary hover:underline font-medium">Contact Support</a>
                </p>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // STATE: APPROVED OR EXPIRED (DASHBOARD)
    // --------------------------------------------------------------------------
    if (status === 'approved' || status === 'active' || status === 'expired') {
        const firstName = profile?.full_name?.split(' ')[0] || 'Member';
        const expiryDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null;
        const isValid = expiryDate && expiryDate > new Date();

        return (
            <div className="space-y-8 animate-fade-in relative z-10">
                {/* HERO WELCOME */}
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-soft border border-gray-100 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Active Membership</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 tracking-tight mb-2">
                                Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">{firstName}</span>
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Membership ID: <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded ml-1">{profile?.registration_number}</span>
                            </p>
                        </div>

                        <Link
                            href="/dashboard/card"
                            className="bg-primary-900 text-white px-6 py-3 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-1 transition-all flex items-center gap-3 font-semibold group/btn"
                        >
                            <CreditCard className="w-5 h-5 text-accent-400" />
                            <span>View Identity Card</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Decorative Background gradient */}
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gray-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Subscription Status */}
                    <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl ${isValid ? 'bg-gradient-to-br from-[#001F54] to-[#001533]' : 'bg-gradient-to-br from-red-900 to-red-950'
                        }`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                    <ShieldCheck className="w-6 h-6 text-accent-300" />
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/80">
                                    {isValid ? 'VALID' : 'EXPIRED'}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm font-medium mb-1">Subscription Expiry</p>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {expiryDate ? expiryDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </h2>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-[16px] border-white/5 opacity-50"></div>
                        <div className="absolute right-2 top-2 w-16 h-16 rounded-full bg-accent-500/20 blur-xl"></div>
                    </div>

                    {/* Fees & Payments */}
                    <Link href="/dashboard/payments" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Fee History</h3>
                            <p className="text-sm text-gray-500">View transactions & download receipts.</p>

                            <div className="mt-4 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                Go to Payments <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>

                    {/* Security Status */}
                    <Link href="/dashboard/profile" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Lock className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Security</h3>
                            <p className="text-sm text-gray-500">Manage password & personal details.</p>

                            <div className="mt-4 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                Manage Profile <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                </div>

                {/* Quick Actions / Featured Identity Card Preview */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-gray-900">Official Membership Card</h3>
                            <Link href="/dashboard/card" className="text-sm font-bold text-primary hover:underline">Full Screen</Link>
                        </div>
                        <div className="relative aspect-[1.586/1] w-full max-w-sm mx-auto bg-gray-900 rounded-xl shadow-2xl overflow-hidden group cursor-pointer border border-gray-800 transform transition hover:scale-[1.02]">
                            {/* Abstract Card Preview */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-black p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
                                    <div className="w-8 h-8 bg-white/10 rounded-md"></div>
                                </div>
                                <div>
                                    <div className="w-32 h-4 bg-white/20 rounded mb-2"></div>
                                    <div className="w-48 h-6 bg-white/30 rounded"></div>
                                </div>
                            </div>
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download PDF
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent-500 to-cyan-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Need Assistance?</h3>
                            <p className="text-accent-100 mb-6 max-w-sm">Contact the SOOOP administration team for queries regarding your membership status or technical issues.</p>
                            <a href="mailto:contact@soopvision.com" className="inline-flex items-center gap-2 bg-white text-accent-700 px-5 py-2.5 rounded-xl font-bold hover:bg-accent-50 transition-colors shadow-lg">
                                Contact Support
                            </a>
                        </div>
                        {/* Decorations */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Loading...</div>;
}

