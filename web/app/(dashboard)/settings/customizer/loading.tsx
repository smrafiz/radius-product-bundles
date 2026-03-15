"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { CustomizerSkeleton } from "@/features/settings/components/style-customizer";

export default function Loading() {
    const t = useTranslations("Settings.Customizer");

    return (
        <s-page heading={t("heading")} inlineSize="large">
            <CustomizerSkeleton />
        </s-page>
    );
}
