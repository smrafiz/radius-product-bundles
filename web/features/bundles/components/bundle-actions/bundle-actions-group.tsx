"use client";

import { useModalStore, useShopSettingsStore } from "@/shared";
import {
    BUNDLE_LISTING_ACTIONS,
    BundleActionsGroupProps,
    BundleListItem,
} from "@/features/bundles";

/**
 * Bundle actions group
 */
export function BundleActionsGroup({
    bundle,
    onAction,
}: BundleActionsGroupProps) {
    const { openModal } = useModalStore();
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

    const handleViewClick = ({
        bundle,
        popoverId,
    }: {
        bundle: BundleListItem;
        popoverId: string;
    }) => {
        console.log(bundle);
    };

    return (
        <>
            {/* Tooltips */}
            {BUNDLE_LISTING_ACTIONS.map((action) => {
                const tooltipId = `${action.key}-${bundle.id}`;
                return (
                    <s-tooltip key={`tooltip-${action.key}`} id={tooltipId}>
                        <s-text>{action.tooltip}</s-text>
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
                            accessibilityLabel={action.tooltip}
                            icon={action.icon}
                            tone={action.tone}
                        />
                    ) : (
                        <s-button
                            key={action.key}
                            slot="secondary-actions"
                            interestFor={tooltipId}
                            accessibilityLabel={action.tooltip}
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
                        <div
                            onClick={() =>
                                handleViewClick({ bundle, popoverId })
                            }
                        >
                            <s-stack gap="small-200">
                                <s-heading>Included products</s-heading>
                                {bundle.products?.length ? (
                                    bundle.products.map((product, index) => (
                                        <s-stack key={`${product.id}-${index}`}>
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
                                    <s-text>No products in this bundle</s-text>
                                )}
                                {bundle.mainProduct && (
                                    <>
                                        <s-divider />
                                        <s-heading>Bundle product</s-heading>
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
                        </div>
                    </s-stack>
                </s-box>
            </s-popover>
        </>
    );
}
