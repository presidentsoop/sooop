"use client";

import { useState } from "react";
import { Search, Shield, User, Clock, CheckCircle, XCircle, LogOut, Lock, AlertTriangle, Key } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SecurityViewProps {
    initialUsers: any[];
}

export default function SecurityView({ initialUsers }: SecurityViewProps) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'active', 'banned'

    // KPI Stats
    const totalUsers = users.length;
    const activeToday = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    const adminCount = users.filter(u => u.profile?.role === 'admin' || (u.app_metadata?.role === 'admin')).length; // Check app_metadata too?

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.profile?.full_name?.toLowerCase().includes(search.toLowerCase());

        const isOnline = user.last_sign_in_at && new Date(user.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (filter === 'active' && !isOnline) return false;
        // if (filter === 'banned' && !user.banned_until) return false; // If we had banned logic

        return matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Today</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeToday}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Admins</p>
                        <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                        <p className="text-gray-500 text-sm">Monitor user activity and security.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64"
                                placeholder="Search users..."
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Today</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 tracking-wider">
                            <tr>
                                <th className="p-6">User</th>
                                <th className="p-6">Authentication</th>
                                <th className="p-6">Created</th>
                                <th className="p-6">Last Active</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => {
                                const isOnline = user.last_sign_in_at && new Date(user.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                    {user.profile?.profile_photo_url ? (
                                                        <Image src={user.profile.profile_photo_url} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                            {user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    {isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">
                                                        {user.profile?.full_name || user.user_metadata?.full_name || 'Unknown User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                                                    {user.profile?.membership_status === 'pending' && (
                                                        <span className="inline-block mt-1 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pending Approval</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-gray-700 badge badge-outline w-fit">
                                                    {user.app_metadata?.provider || 'Email'}
                                                </span>
                                                <span className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm text-gray-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {user.last_sign_in_at ? (
                                                <>
                                                    <div className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {isOnline ? 'Active Recently' : 'Offline'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-400">Never</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 bg-gray-100 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition"
                                                    title="Force Sign Out / Revoke Sessions"
                                                    onClick={() => toast.info("Revoke session feature coming soon")}
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                                                    title="Send Password Reset"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                                    title="Ban User"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400">
                                        No users found matching your filters.
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
