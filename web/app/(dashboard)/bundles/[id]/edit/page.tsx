import { Metadata } from "next";
import { EditBundlePage, } from "@/features/bundles";

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
export default function EditBundleByIdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <EditBundlePage params={params} />;
}
