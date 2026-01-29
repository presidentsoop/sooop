"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, User, ChevronRight, ChevronLeft, Mail, ShieldAlert, CreditCard, DollarSign, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

import { toast } from "sonner";
import Image from "next/image";
import { signOutAction } from "@/app/actions/auth";

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole: 'admin' | 'member';
    userName?: string;
    userEmail?: string;
}

export default function DashboardLayout({ children, userRole, userName, userEmail }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [pages, setPages] = useState<any[]>([]);

    const pathname = usePathname();

    const supabase = createClient();
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        // Use fixed locale to prevent hydration mismatch (server vs client locale)
        setCurrentDate(new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    useEffect(() => {
        if (userRole === 'admin') {
            const fetchPages = async () => {
                const { data } = await supabase.from('pages').select('id, title, slug').order('sort_order', { ascending: true });
                if (data) setPages(data);
            };
            fetchPages();
        }
    }, [userRole]);

    const handleSignOut = async () => {
        try {
            await signOutAction();
            toast.success("Signed out successfully");
            window.location.href = "/login";
        } catch (error) {
            console.error(error);
            toast.error("Error signing out");
        }
    };

    const adminLinks = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/members", label: "All Members", icon: Users },
        { href: "/dashboard/verify", label: "Verify Applications", icon: FileText },
        { href: "/dashboard/events", label: "Manage Events", icon: Calendar },
        { href: "/dashboard/leadership", label: "Leadership & Wings", icon: Users },
        { href: "/dashboard/fees", label: "Nomination Fees", icon: DollarSign },
        { href: "/dashboard/campaigns", label: "Email Campaigns", icon: Mail },
        { href: "/dashboard/security", label: "User & Security", icon: ShieldAlert },
        { href: "/dashboard/audit", label: "Audit Logs", icon: FileText },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const memberLinks = [
        { href: "/dashboard", label: "My Overview", icon: LayoutDashboard },
        { href: "/dashboard/card", label: "Membership Card", icon: CreditCard },
        { href: "/dashboard/profile", label: "My Profile", icon: User },
        { href: "/dashboard/payments", label: "Fee & Payments", icon: DollarSign },
        { href: "/dashboard/documents", label: "My Documents", icon: FileText },
        { href: "/dashboard/settings", label: "Security Settings", icon: Settings },
    ];

    const links = userRole === 'admin' ? adminLinks : memberLinks;

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-accent-500 selection:text-white">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-primary-900 text-white transform transition-transform duration-300 ease-out shadow-2xl flex flex-col border-r border-white/5 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center px-8 border-b border-white/10 bg-primary-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20 ring-1 ring-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="font-heading font-black text-xl text-white tracking-tighter relative z-10">S</span>
                        </div>
                        <div>
                            <h1 className="font-heading font-bold text-xl tracking-tight leading-none text-white">SOOOP</h1>
                            <p className="text-[10px] text-accent-300 font-bold tracking-[0.2em] uppercase mt-1 opacity-80">Membership</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1 custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-50">Main Menu</p>
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 outline-none relative overflow-hidden ${isActive
                                    ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20 font-semibold"
                                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-colors relative z-10 ${isActive ? "text-white" : "text-gray-500 group-hover:text-accent-300"}`} />
                                <span className="tracking-wide text-sm relative z-10">{link.label}</span>
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                )}
                            </Link>
                        );
                    })}

                    {/* CMS Links (Admin Only) */}
                    {userRole === 'admin' && pages.length > 0 && (
                        <div className="mt-8">
                            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-50">Content</p>
                            {pages.map(page => (
                                <Link
                                    key={page.id}
                                    href={`/dashboard/cms/${page.slug}`}
                                    className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm ${pathname === `/dashboard/cms/${page.slug}`
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 opacity-50" />
                                    <span className="truncate">{page.title}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 bg-primary-950/20 space-y-2">
                    <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-3 border border-white/5 flex items-center gap-3 relative group overflow-hidden transition-all hover:bg-white/10 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-500 to-purple-500 p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-full bg-primary-900 flex items-center justify-center overflow-hidden">
                                {userName ? (
                                    <div className="w-full h-full bg-primary-800 flex items-center justify-center font-bold text-sm">
                                        {userName[0]}
                                    </div>
                                ) : <User className="w-5 h-5" />}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <p className="text-sm font-bold text-white truncate group-hover:text-accent-200 transition-colors">{userName}</p>
                            <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-semibold">{userRole}</p>
                        </div>

                        {/* Logout Button Absolute */}
                        <button
                            onClick={handleSignOut}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div>
                            <h2 className="text-xl font-heading font-bold text-gray-900 tracking-tight">
                                {links.find(l => l.href === pathname)?.label || (pathname.includes('cms') ? 'Content Manager' : 'Dashboard')}
                            </h2>
                            <p className="hidden md:block text-xs text-gray-500 font-medium">{currentDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            {/* Status Indicator */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200/60 shadow-sm">
                                <div className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{userRole}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
