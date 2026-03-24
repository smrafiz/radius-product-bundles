import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { BundleTypeSelection } from "@/features/bundles";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.bundleCreate");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function BundleTypeSelectionPage() {
    return <BundleTypeSelection />;
}
