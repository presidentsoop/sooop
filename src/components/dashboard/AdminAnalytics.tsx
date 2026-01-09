"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface AdminAnalyticsProps {
    stats: {
        total: number;
        pending: number;
        active: number;
        expired: number;
    };
    growthData: any[];
    statusData: any[];
}

// Brand Colors from Tailwind Config
const THEME_COLORS = {
    primary: '#001F54',
    accent: '#00A8CC',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: '#E5E7EB'
};

const StatCard = ({ label, value, icon: Icon, type, subtext, highlight = false }: any) => {
    // Define styles based on type to match brand theme
    let colorStyles = "";
    let iconStyles = "";

    switch (type) {
        case 'primary':
            colorStyles = "bg-primary-50 text-primary-600 border-primary-100";
            iconStyles = "text-primary-600";
            break;
        case 'success':
            colorStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
            iconStyles = "text-emerald-600";
            break;
        case 'warning':
            colorStyles = "bg-amber-50 text-amber-600 border-amber-100";
            iconStyles = "text-amber-600";
            break;
        case 'error':
            colorStyles = "bg-rose-50 text-rose-600 border-rose-100";
            iconStyles = "text-rose-600";
            break;
        default:
            colorStyles = "bg-gray-50 text-gray-600 border-gray-100";
            iconStyles = "text-gray-600";
    }

    return (
        <div className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${highlight ? 'ring-2 ring-primary ring-opacity-20 border-primary-200' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {subtext && <div className="mt-2 text-xs font-medium">{subtext}</div>}
                </div>
                <div className={`p-3 rounded-xl ${colorStyles} bg-opacity-50`}>
                    <Icon className={`w-6 h-6 ${iconStyles}`} />
                </div>
            </div>
            {highlight && (
                <div className="mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs font-semibold text-primary animate-pulse">Action Required</span>
                </div>
            )}
        </div>
    );
};

const PIE_COLORS = [THEME_COLORS.success, THEME_COLORS.warning, THEME_COLORS.error, THEME_COLORS.gray];

export default function AdminAnalytics({ stats, growthData, statusData }: AdminAnalyticsProps) {
    return (
        <div className="space-y-8 animate-fade-in p-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time performance metrics and community statistics.</p>
                </div>
                {/* System Status Pill */}
                <div className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 shadow-sm self-start sm:self-auto">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>System Online</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total - Primary Brand Color */}
                <StatCard
                    label="Total Members"
                    value={stats.total}
                    icon={Users}
                    type="primary"
                    subtext={<span className="text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Growing Community</span>}
                />

                {/* Active - Success Color */}
                <StatCard
                    label="Active Subscriptions"
                    value={stats.active}
                    icon={CheckCircle}
                    type="success"
                    subtext={<span className="text-emerald-600">{((stats.active / (stats.total || 1)) * 100).toFixed(0)}% Approval Rate</span>}
                />

                {/* Pending - Warning Color (Highlighted if > 0) */}
                <StatCard
                    label="Pending Approvals"
                    value={stats.pending}
                    icon={Clock}
                    type="warning"
                    subtext={<span className="text-amber-600">+ New applications</span>}
                    highlight={stats.pending > 0}
                />

                {/* Expired - Error Color */}
                <StatCard
                    label="Expired / Inactive"
                    value={stats.expired}
                    icon={AlertCircle}
                    type="error"
                    subtext={<span className="text-rose-600">Requires Attention</span>}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Growth Analytics</h3>
                            <p className="text-xs text-gray-400">Monthly new member registrations</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: THEME_COLORS.primary, fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={THEME_COLORS.primary}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex flex-col">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Member Status</h3>
                        <p className="text-xs text-gray-400">Distribution of community health</p>
                    </div>
                    <div className="h-[300px] w-full flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {statusData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    layout="horizontal"
                                    wrapperStyle={{ fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
