import { Metadata } from "next";
import { EditBundlePage } from "@/features/bundles";

/**
 * Generate metadata
 */
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Edit Bundle | Bundle Builder",
        description: "Edit your existing product bundle.",
    };
}

/**
 * Edit Bundle Page
 */
export default async function EditBundleByIdPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    return <EditBundlePage params={params} />;
}
