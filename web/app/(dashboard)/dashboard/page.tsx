import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { DashboardPage } from "@/features/dashboard";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.dashboard");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <DashboardPage />;
}
