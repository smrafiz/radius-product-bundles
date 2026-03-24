"use client";

import { useModalStore, useShopSettingsStore } from "@/shared";
import {
    BUNDLE_LISTING_ACTIONS,
    BundleActionsGroupProps,
    BundleListItem,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle actions group
 */
export function BundleActionsGroup({
    bundle,
    onAction,
}: BundleActionsGroupProps) {
    const { openModal } = useModalStore();
    const t = useTranslations("Bundles.Actions");
    const popoverId = `bundle-view-popover-${bundle.id}`;
    const { settings } = useShopSettingsStore();
    const shopDomain = settings?.myshopifyDomain;

    const handleActionClick = (actionKey: string) => {
        switch (actionKey) {
            case "edit":
                onAction.edit();
                break;

            case "view":
                onAction.view();
                break;

            case "duplicate":
                openModal({
                    type: "duplicate",
                    bundle,
                    onConfirm: async () => {
                        await onAction.duplicate();
                    },
                });
                break;

            case "delete":
                // Set modal data BEFORE it opens
                openModal({
                    type: "delete",
                    bundle,
                    onConfirm: async () => {
                        await onAction.delete();
                    },
                });
                break;
        }
    };

    return (
        <>
            {/* Tooltips */}
            {BUNDLE_LISTING_ACTIONS.map((action) => {
                const tooltipId = `${action.key}-${bundle.id}`;
                return (
                    <s-tooltip key={`tooltip-${action.key}`} id={tooltipId}>
                        <s-text>{t(action.key)}</s-text>
                    </s-tooltip>
                );
            })}

            {/* Segmented button group */}
            <s-button-group gap="none">
                {BUNDLE_LISTING_ACTIONS.map((action) => {
                    const tooltipId = `${action.key}-${bundle.id}`;
                    const isModalAction =
                        action.key === "delete" || action.key === "duplicate";

                    return action.key === "view" ? (
                        <s-button
                            key={action.key}
                            slot="secondary-actions"
                            interestFor={tooltipId}
                            commandFor={popoverId}
                            accessibilityLabel={t(action.key)}
                            icon={action.icon}
                            tone={action.tone}
                        />
                    ) : (
                        <s-button
                            key={action.key}
                            slot="secondary-actions"
                            interestFor={tooltipId}
                            accessibilityLabel={t(action.key)}
                            icon={action.icon}
                            tone={action.tone}
                            {...(isModalAction
                                ? {
                                      commandFor: "radius-bundles-app-modal",
                                      command: "--show",
                                  }
                                : {})}
                            onClick={() => handleActionClick(action.key)}
                        />
                    );
                })}
            </s-button-group>
            {/* Popover */}
            <s-popover id={popoverId}>
                <s-box padding="small">
                    <s-stack gap="small">
                        <s-stack gap="small-200">
                            <s-heading>{t("includedProducts")}</s-heading>
                            {bundle.products?.length ? (
                                [
                                    ...new Map(
                                        bundle.products.map((p) => [p.id, p]),
                                    ).values(),
                                ].map((product) => (
                                    <s-stack key={product.id}>
                                        <a
                                            href={`https://${shopDomain}/products/${product.handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            <s-text>{product.title}</s-text>
                                        </a>
                                    </s-stack>
                                ))
                            ) : (
                                <s-text>{t("noProducts")}</s-text>
                            )}
                            {bundle.mainProduct && (
                                <>
                                    <s-divider />
                                    <s-heading>{t("bundleProduct")}</s-heading>
                                    <a
                                        href={`https://${shopDomain}/products/${bundle.mainProduct.handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        <s-text>
                                            {bundle.mainProduct.title}
                                        </s-text>
                                    </a>
                                </>
                            )}
                        </s-stack>
                    </s-stack>
                </s-box>
            </s-popover>
        </>
    );
}
