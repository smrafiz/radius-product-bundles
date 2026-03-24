import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { BundleListingPage } from "@/features/bundles";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.bundles");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <BundleListingPage />;
}
