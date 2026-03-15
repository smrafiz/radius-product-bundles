import { Metadata } from "next";
import { getStaticTranslations } from "@/lib/i18n/server";
import { CustomizerBundleType } from "@/features/settings/components/style-customizer";


export async function generateMetadata(): Promise<Metadata> {
    const t = await getStaticTranslations("Meta.pages.customizer");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <CustomizerBundleType />;
}
