"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, User, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

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
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (userRole === 'admin') {
            const fetchPages = async () => {
                const { data } = await supabase.from('pages').select('id, title, slug').order('slug');
                if (data) setPages(data);
            };
            fetchPages();
        }
    }, [userRole]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Error signing out");
        } else {
            toast.success("Signed out successfully");
            router.push("/login");
        }
    };

    const adminLinks = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/members", label: "Members", icon: Users },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const memberLinks = [
        { href: "/dashboard", label: "My Membership", icon: User },
        { href: "/dashboard/documents", label: "Documents", icon: FileText },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const links = userRole === 'admin' ? adminLinks : memberLinks;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside
                className={`hidden lg:flex flex-col bg-white border-r border-gray-200 fixed h-full z-40 transition-all duration-300 ease-in-out shadow-sm ${isCollapsed ? "w-20" : "w-72"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-gray-100 relative">
                    <div className={`flex items-center gap-3 w-full ${isCollapsed ? "justify-center" : "justify-start"}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200 flex-shrink-0">
                            S
                        </div>
                        {!isCollapsed && (
                            <span className="font-bold text-xl text-gray-900 tracking-tight whitespace-nowrap overflow-hidden animate-fade-in">
                                SOOOP
                            </span>
                        )}
                    </div>
                </div>

                {/* Toggle Button - Always Visible */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary shadow-md transition-all z-50 transform hover:scale-110"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                title={isCollapsed ? link.label : ""}
                                className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? "bg-primary-50 text-primary-700 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    } ${isCollapsed ? "justify-center" : ""}`}
                            >
                                <Icon className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                                {!isCollapsed && <span className="truncate">{link.label}</span>}
                            </Link>
                        );
                    })}

                    {/* CMS Menu for Admins */}
                    {userRole === 'admin' && pages.length > 0 && (
                        <div className="pt-4">
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content Management</h3>
                            )}
                            <div className="space-y-1">
                                {pages.map(page => (
                                    <Link
                                        key={page.id}
                                        href={`/dashboard/cms/${page.slug}`}
                                        title={isCollapsed ? page.title : ""}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${pathname === `/dashboard/cms/${page.slug}`
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            } ${isCollapsed ? "justify-center" : ""}`}
                                    >
                                        <FileText className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${pathname === `/dashboard/cms/${page.slug}` ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        {!isCollapsed && <span className="truncate">{page.title}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Footer with Popover Menu */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 relative group">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={`w-full flex items-center gap-3 hover:bg-white p-2 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100 ${isCollapsed ? "justify-center" : ""}`}
                        title="User Menu"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-700 font-bold overflow-hidden border-2 border-white shadow-md">
                                {userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0 text-left overflow-hidden">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? '-rotate-90' : ''}`} />
                            </>
                        )}
                    </button>

                    {/* Desktop User Menu Popover */}
                    {isUserMenuOpen && (
                        <div className={`absolute bottom-full left-0 w-full mb-2 px-4 z-50 animate-fade-in-up ${isCollapsed ? 'left-14 w-60 px-0' : ''}`}>
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className="p-2 space-y-1">
                                    <div className="px-3 py-2 border-b border-gray-100 mb-1 lg:hidden">
                                        <p className="font-semibold text-sm">{userName}</p>
                                        <p className="text-xs text-gray-500">{userEmail}</p>
                                    </div>
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4" /> My Profile
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Header - High Contrast & Fixed */}
            <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        S
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">SOOOP</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-slide-right">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                            <span className="font-bold text-xl text-gray-900">Menu</span>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${isActive
                                            ? "bg-primary-50 text-primary-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold">
                                    {userName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main
                className={`flex-1 min-h-screen bg-gray-50/50 transition-[margin] duration-300 ease-in-out
                ${isCollapsed ? "lg:ml-20" : "lg:ml-72"} 
                pt-16 lg:pt-0
                `}
            >
                <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
