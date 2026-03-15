import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { SettingsPage } from "@/features/settings/components/settings-page";


export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.settings");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <SettingsPage />;
}
