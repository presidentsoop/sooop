import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserImporter from "@/components/dashboard/UserImporter";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ImportMembersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') redirect("/dashboard");

    return (
        <DashboardLayout
            userRole="admin"
            userName={profile?.full_name || 'Admin'}
            userEmail={user.email}
        >
            <div className="space-y-6 fade-in-up">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/members" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Import Members</h1>
                        <p className="text-gray-500">Add members in bulk from Excel records.</p>
                    </div>
                </div>

                <UserImporter />
            </div>
        </DashboardLayout>
    );
}
