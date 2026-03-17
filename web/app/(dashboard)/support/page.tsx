import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { SupportPage } from "@/features/support";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.support");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <SupportPage />;
}
