"use client";

import Link from "next/link";
import { User, FileText, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import MembershipForm from "@/components/auth/MembershipForm";

interface MemberViewProps {
    status: string; // 'none' | 'pending' | 'approved' | 'rejected'
    profile?: any;
}

export default function MemberView({ status, profile }: MemberViewProps) {
    if (status === 'none' || !status) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Action Required</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>You have created an account but haven't submitted your membership application yet. Please complete the form below to proceed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Membership Application</h2>
                        <p className="text-sm text-gray-500">Please provide accurate details for official records.</p>
                    </div>
                    <div className="p-6">
                        <MembershipForm />
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <ClockIcon className="w-10 h-10 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Your application has been submitted and is currently being reviewed by our administrative team.
                    This process typically takes 2-3 business days. You will be notified via email once a decision is made.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-left max-w-md mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Documents Verification</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Payment Confirmation</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-300" /> Final Approval</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-300" /> ID Card Issuance</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (status === 'approved') {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900">Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}!</h1>
                        <p className="text-gray-600">Your membership is active.</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Active Member
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary mb-4">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Digital ID Card</h3>
                        <p className="text-sm text-gray-500 mb-4">View and download your official membership card.</p>
                        <Link href="/dashboard/card" className="text-sm font-medium text-primary hover:underline">View Card &rarr;</Link>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary mb-4">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Certificates</h3>
                        <p className="text-sm text-gray-500 mb-4">Download your membership certificate and other docs.</p>
                        <Link href="/dashboard/documents" className="text-sm font-medium text-primary hover:underline">View Documents &rarr;</Link>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Unknown Status</div>;
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
