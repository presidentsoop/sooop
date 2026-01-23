import { createClient } from "@/lib/supabase/server";
import DocumentManager from "@/components/dashboard/DocumentManager";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
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
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">My Documents</h1>
                    <p className="text-gray-500">Upload your verification documents securely.</p>
                </div>

                <DocumentManager userId={user.id} />
            </div>
        </DashboardLayout>
    );
}

