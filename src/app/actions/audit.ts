"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function logAuditAction(action: string, details: any, performedBy?: string) {
    const supabase = await createClient();

    // If performedBy not provided, try to get from session
    let userId = performedBy;
    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.email || user?.id || 'system';
    }

    // Get IP
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";

    const { error } = await supabase.from('audit_logs').insert({
        action,
        details,
        performed_by: userId,
        ip_address: ip
    });

    if (error) {
        console.error("Audit Log Error:", error);
    }
}
