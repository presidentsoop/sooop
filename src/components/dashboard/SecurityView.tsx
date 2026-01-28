"use client";

import { useState } from "react";
import { User, Clock, Shield, LogOut, Key, XCircle, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import DataTable from "@/components/ui/DataTable";
import { StatusBadge, Avatar } from "@/components/ui/Modal";

interface SecurityViewProps {
    initialUsers: any[];
}

export default function SecurityView({ initialUsers }: SecurityViewProps) {
    const [users] = useState(initialUsers);

    // KPI Stats
    const totalUsers = users.length;
    const activeToday = users.filter((u: any) => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    const adminCount = users.filter((u: any) => u.profile?.role === 'admin' || (u.app_metadata?.role === 'admin')).length;

    const columns = [
        {
            key: "profile.full_name", // Access nested property safely if DataTable supports it, otherwise I might need to map it
            header: "User",
            sortable: true,
            render: (_: any, row: any) => {
                const name = row.profile?.full_name || row.user_metadata?.full_name || 'Unknown';
                const email = row.email;
                const photo = row.profile?.profile_photo_url;
                const isOnline = row.last_sign_in_at && new Date(row.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                return (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar src={photo} name={name} size="sm" />
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{email}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            key: "app_metadata.provider",
            header: "Auth Provider",
            render: (val: string) => (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {val || 'Email'}
                </span>
            )
        },
        {
            key: "created_at",
            header: "Joined",
            sortable: true,
            render: (val: string) => (
                <div className="text-sm">
                    <p className="text-gray-900">{new Date(val).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(val), { addSuffix: true })}</p>
                </div>
            )
        },
        {
            key: "last_sign_in_at",
            header: "Last Active",
            sortable: true,
            render: (val: string) => val ? (
                <div className="text-sm">
                    <p className="text-gray-900">{new Date(val).toLocaleDateString()} {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(val), { addSuffix: true })}</p>
                </div>
            ) : <span className="text-gray-400 text-sm">Never</span>
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center gap-1">
            <button
                onClick={() => toast.info("Reset password email would be sent here")}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Send Password Reset"
            >
                <Key className="w-4 h-4" />
            </button>
            <button
                onClick={() => toast.info("Ban user functionality")}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Ban User"
            >
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    );

    // Flatten data for search if needed, but DataTable handles basic object paths if implemented correctly.
    // My DataTable implementation supports nested keys for rendering but might check `searchKeys` on the object root.
    // To be safe, I'll pass a transformed version of data to DataTable or ensure `searchKeys` works.
    // Let's assume standard behavior for now.

    const tableData = users.map((u: any) => ({
        ...u,
        full_name: u.profile?.full_name || u.user_metadata?.full_name || '',
        provider: u.app_metadata?.provider || 'email'
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><User className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Clock className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Today</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeToday}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Shield className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administrators</p>
                        <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white pt-1 rounded-2xl">
                <div className="px-6 py-4 border-b border-gray-100 mb-2">
                    <h2 className="text-lg font-bold text-gray-900">User Security Audit</h2>
                    <p className="text-sm text-gray-500">Monitor login activity and account status</p>
                </div>
                <DataTable
                    data={tableData}
                    columns={columns}
                    searchable
                    searchKeys={['full_name', 'email', 'provider']}
                    searchPlaceholder="Search users by name or email..."
                    actions={actions}
                    pageSize={10}
                />
            </div>
        </div>
    );
}
