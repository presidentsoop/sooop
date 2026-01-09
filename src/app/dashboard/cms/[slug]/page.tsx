import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, GripVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function PageEditor({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Auth Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect("/dashboard");
    }

    // Fetch Page
    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!page) {
        notFound();
    }

    // Fetch Sections
    const { data: sections } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', page.id)
        .order('sort_order');

    return (
        <DashboardLayout
            userRole="admin"
            userName={profile.full_name}
            userEmail={user.email}
        >
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">{page.title} Page</h1>
                    <p className="text-gray-500 mt-2">Manage sections and content for {slug}.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition shadow-sm">
                    <Plus className="w-4 h-4" /> Add Section
                </button>
            </div>

            <div className="space-y-4">
                {sections && sections.length > 0 ? (
                    sections.map((section) => (
                        <div key={section.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-primary-100 transition-colors">
                            <div className="text-gray-400 cursor-move hover:text-gray-600 p-2">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wider mb-1">
                                    {section.type}
                                </span>
                                <h3 className="font-semibold text-gray-900 capitalize">{section.type.replace('-', ' ')} Section</h3>
                                <p className="text-xs text-gray-400 truncate max-w-md">
                                    ID: {section.id}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/dashboard/cms/${slug}/${section.id}`}
                                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Edit Section"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Section">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Sections Yet</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1 mb-6">
                            Start building this page by adding your first content section.
                        </p>
                        <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                            Add Default Sections
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
