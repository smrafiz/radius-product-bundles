"use client";

import { ROUTES } from "@/shared/constants";
import { PlanIcon } from "@/features/dashboard";
import { MediaCard, useAppNavigation } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function DashboardMediaCard() {
    const { goTo } = useAppNavigation();
    const t = useTranslations("Dashboard.MediaCard");

    return (
        <MediaCard
            title={t("title")}
            description={t("description")}
            buttonLabel={t("button")}
            onButtonClick={goTo(ROUTES.PRICING)}
            icon={<PlanIcon />}
        />
    );
}
