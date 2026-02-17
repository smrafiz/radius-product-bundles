import { Metadata } from "next";
import { checkBundleExists } from "@/features/bundles/services";
import { EditBundlePage, BundleRedirect } from "@/features/bundles";

/**
 * Generate metadata
 */
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Bundle Builder - Edit Bundle",
        description: "Edit your existing product bundle.",
    };
}

/**
 * Edit Bundle Page
 */
export default async function EditBundleByIdPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const { exists, isDeleted } = await checkBundleExists(params.id);

    if (!exists || isDeleted) {
        return <BundleRedirect to="/bundles" />;
    }

    return <EditBundlePage params={params} />;
}
