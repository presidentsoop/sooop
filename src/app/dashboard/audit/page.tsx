import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuditLogsClient from "./AuditLogsClient";

export default async function AuditPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Admin-only page
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        redirect("/dashboard");
    }

    return <AuditLogsClient />;
}
