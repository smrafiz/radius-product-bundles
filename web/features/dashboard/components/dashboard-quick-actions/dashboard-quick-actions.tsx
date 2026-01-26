"use client";

import { useAppNavigation } from "@/shared";
import { getEnabledQuickActions } from "@/features/dashboard";

/*
 * Dashboard quick actions
 */
export const DashboardQuickActions = () => {
    const { goTo } = useAppNavigation();
    const actions = getEnabledQuickActions();

    return (
        <s-section>
            <s-grid paddingBlockEnd="large">
                <s-stack>
                    <s-heading>Quick Actions</s-heading>
                    <s-text>
                        Common tasks and shortcuts for managing your product
                        bundles
                    </s-text>
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
                                accessibilityLabel="Manage Bundle"
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
                                                    __html: action.img?.svg,
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
