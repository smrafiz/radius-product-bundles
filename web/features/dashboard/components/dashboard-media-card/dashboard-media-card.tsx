"use client";

import { ROUTES } from "@/shared/constants";
import { PlanIcon } from "@/features/dashboard";
import { MediaCard, useAppNavigation } from "@/shared";

export function DashboardMediaCard() {
    const { goTo } = useAppNavigation();

    return (
        <MediaCard
            title="Update your plan"
            description="Unlock advanced features and priority support. Upgrade today to get the most out of your bundles."
            buttonLabel="See details"
            onButtonClick={goTo(ROUTES.PRICING)}
            icon={<PlanIcon />}
        />
    );
}
