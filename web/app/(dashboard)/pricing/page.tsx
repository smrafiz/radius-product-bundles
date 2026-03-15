import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { PricingPage } from "@/features/pricing";


export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.pricing");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <PricingPage />;
}
