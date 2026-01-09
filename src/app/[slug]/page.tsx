import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/cms/cms-server";
import SectionRenderer from "@/components/cms/SectionRenderer";
import { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);
    if (!page) return {};
    return {
        title: page.title,
        description: page.description,
    };
}

export default async function Page(props: { params: Params }) {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <main>
            {page.sections.map((section, index) => (
                <SectionRenderer key={index} section={section} />
            ))}
        </main>
    );
}
