"use client";

import { useTranslations } from "@/lib/i18n/provider";

export default function ABTestingPage() {
    const t = useTranslations("ABTesting");

    return (
        <s-page heading={t("title")}>
            <div className="flex items-center justify-center p-8">
                <p>{t("comingSoon")}</p>
            </div>
        </s-page>
    );
}