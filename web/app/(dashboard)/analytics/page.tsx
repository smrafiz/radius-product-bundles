import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { AnalyticsPage } from "@/features/analytics";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.analytics");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <AnalyticsPage />;
}
