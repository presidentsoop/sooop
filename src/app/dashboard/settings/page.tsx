import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Settings, Bell, Shield, Key } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <DashboardLayout
            userRole={profile?.role || 'member'}
            userName={profile?.full_name}
            userEmail={user.email}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-500 mt-2">Manage application preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <p className="text-xs text-gray-500">Manage email alerts</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Email Notifications</span>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Marketing Updates</span>
                            <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Security</h3>
                            <p className="text-xs text-gray-500">Password & Auth</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/profile"
                            className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            <Key className="w-4 h-4" /> Change Password
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
