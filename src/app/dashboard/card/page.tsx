import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import IdentityCard from "@/components/dashboard/IdentityCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function IDCardPage() {
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

    // Auth Check
    if (profile?.membership_status !== 'approved') {
        redirect("/dashboard"); // Only approved members can see this
    }


    return (
        <div className="flex flex-col items-center py-10 fade-in-up">
            <div className="w-full max-w-4xl flex justify-start mb-8">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium">
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Digital Identity</h1>
            <p className="text-gray-500 mb-12 text-center max-w-md">
                Official SOOOP Membership Card. Valid for entry to all events and workshops.
            </p>

            <IdentityCard profile={profile} />
        </div>
    );
}
