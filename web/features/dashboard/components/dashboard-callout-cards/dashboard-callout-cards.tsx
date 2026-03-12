"use client";

import { CalloutCard } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";
import { getDashboardCalloutCards } from "@/features/dashboard";

export function DashboardCalloutCards() {
    const t = useTranslations("Dashboard.CalloutCards");

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
            gap="base"
            justifyContent="center"
        >
            {getDashboardCalloutCards(t).map(
                ({ title, icon, description, primaryButton }, index) => (
                    <s-grid-item key={index} gridColumn="auto">
                        <CalloutCard
                            title={title}
                            icon={icon}
                            description={description}
                            primaryButton={primaryButton}
                        />
                    </s-grid-item>
                ),
            )}
        </s-grid>
    );
}
