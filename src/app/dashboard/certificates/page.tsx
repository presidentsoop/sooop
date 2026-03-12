import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CertificatesView from "@/components/dashboard/certificates/CertificatesView";

export default async function CertificatesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/dashboard");

    // Fetch certificates
    const { data: certificates } = await supabase
        .from("meeting_certificates")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch all active members for recipient selection
    const { data: members } = await supabase
        .from("profiles")
        .select("id, full_name, email, membership_type, city, membership_status, registration_number")
        .in("membership_status", ["active", "approved"])
        .order("full_name", { ascending: true });

    return (
        <DashboardLayout
            userRole="admin"
            userName={profile?.full_name}
            userEmail={profile?.email}
        >
            <CertificatesView
                initialCertificates={certificates || []}
                allMembers={members || []}
            />
        </DashboardLayout>
    );
}
