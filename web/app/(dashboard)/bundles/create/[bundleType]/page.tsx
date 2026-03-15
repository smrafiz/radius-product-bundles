import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { BUNDLE_TYPES, BundleType, CreateBundlePage } from "@/features/bundles";


export function generateStaticParams() {
    return Object.values(BUNDLE_TYPES).map((type) => ({
        bundleType: type.slug,
    }));
}

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
        const t = await getStaticTranslations("Meta.pages.bundleCreateFallback");
        return {
            title: t("title"),
            description: t("description"),
        };
    }

    return {
        title: `Bundle Builder - Create ${bundleConfig.label}`,
        description: `Create a ${bundleConfig.label.toLowerCase()} to boost your sales. ${bundleConfig.description} Configure products, set pricing, and launch in minutes.`,
    };
}

/**
 * Create Bundle by Type Page
 */
export default async function CreateBundleByTypePage(props: {
    params: Promise<{ bundleType: BundleType }>;
}) {
    const params = await props.params;
    return <CreateBundlePage params={params} />;
}
