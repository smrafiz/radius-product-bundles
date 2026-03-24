"use client";

import { useAppNavigation, sanitizeHtml } from "@/shared";
import { getEnabledQuickActions } from "@/features/dashboard";
import { useTranslations } from "@/lib/i18n/provider";

/*
 * Dashboard quick actions
 */
export const DashboardQuickActions = () => {
    const { goTo } = useAppNavigation();
    const t = useTranslations("Dashboard.QuickActions");
    const actions = getEnabledQuickActions(t);

    return (
        <s-section>
            <s-grid paddingBlockEnd="large">
                <s-stack gap="small-300">
                    <s-heading>{t("heading")}</s-heading>
                    <s-text>{t("description")}</s-text>
                </s-stack>
            </s-grid>
            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                gap="base"
                justifyContent="center"
            >
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="transition-all hover:-translate-y-[3px]"
                    >
                        <s-grid-item>
                            <s-clickable
                                onClick={goTo(action.url)}
                                border="base"
                                borderRadius="base"
                                padding="base"
                                inlineSize="100%"
                                accessibilityLabel={action.title}
                            >
                                <s-grid
                                    gridTemplateColumns="auto 1fr auto"
                                    alignItems="stretch"
                                    gap="base"
                                >
                                    <s-box>
                                        {action.img?.url && (
                                            <img
                                                className="w-11 h-11"
                                                src={action.img.url}
                                                alt={action.img.alt}
                                            />
                                        )}
                                        {action.img?.svg && (
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtml(
                                                        action.img.svg,
                                                    ),
                                                }}
                                            />
                                        )}
                                    </s-box>
                                    <s-box>
                                        <s-heading>{action.title}</s-heading>
                                        <s-paragraph>
                                            {action.description}
                                        </s-paragraph>
                                    </s-box>
                                </s-grid>
                            </s-clickable>
                        </s-grid-item>
                    </div>
                ))}
            </s-grid>
        </s-section>
    );
};
