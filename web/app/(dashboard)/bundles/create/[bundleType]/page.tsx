import { Metadata } from "next";
import { BUNDLE_TYPES, BundleType, CreateBundlePage } from "@/features/bundles";

/**
 * Generate metadata dynamically based on the bundle type
 */
export async function generateMetadata({
    params,
}: {
    params: {
        bundleType: string;
    };
}): Promise<Metadata> {
    const { bundleType } = await params;

    const bundleConfig = Object.values(BUNDLE_TYPES).find(
        (type) => type.slug === bundleType,
    );

    if (!bundleConfig) {
        return {
            title: "Create Bundle",
            description: "Create a new product bundle to increase sales.",
        };
    }

    return {
        title: `Create ${bundleConfig.label} | Bundle Builder`,
        description: `Create a ${bundleConfig.label.toLowerCase()} to boost your sales. ${bundleConfig.description} Configure products, set pricing, and launch in minutes.`,
    };
}

/**
 * Create Bundle by Type Page
 */
export default async function CreateBundleByTypePage(
    props: {
        params: Promise<{ bundleType: BundleType }>;
    }
) {
    const params = await props.params;
    return <CreateBundlePage params={params} />;
}
