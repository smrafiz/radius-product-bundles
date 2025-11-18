"use client";
import { CalloutCard } from "@/shared";
import { DASHBOARD_CALLOUT_CARDS } from "@/features/dashboard";

export function DashboardCalloutCards() {
    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
            gap="base"
            justifyContent="center"
        >
            {DASHBOARD_CALLOUT_CARDS.map(
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
