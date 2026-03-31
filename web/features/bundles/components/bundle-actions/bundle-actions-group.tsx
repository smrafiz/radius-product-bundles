"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { useModalStore, useCrossSellStore, usePlan, useShopSettingsStore } from "@/shared";
import { BUNDLE_LISTING_ACTIONS, BundleActionsGroupProps, } from "@/features/bundles";

/**
 * Bundle actions group
 */
export function BundleActionsGroup({
    bundle,
    onAction,
}: BundleActionsGroupProps) {
    const { openModal } = useModalStore();
    const { open: openCrossSell } = useCrossSellStore();
    const { canUse } = usePlan();
    const t = useTranslations("Bundles.Actions");
    const canDuplicate = canUse("duplicate_bundle");
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
                if (canDuplicate) {
                    openModal({
                        type: "duplicate",
                        bundle,
                        onConfirm: async () => {
                            await onAction.duplicate();
                        },
                    });
                } else {
                    openCrossSell(t("duplicate"));
                }
                break;

            case "delete":
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
                        <s-text>
                            {action.key === "duplicate" && !canDuplicate
                                ? `${t(action.key)} (Pro)`
                                : t(action.key)}
                        </s-text>
                    </s-tooltip>
                );
            })}

            {/* Segmented button group */}
            <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-button-group gap="none">
                    {BUNDLE_LISTING_ACTIONS.filter(
                        (a) => a.key !== "duplicate" || canDuplicate,
                    ).map((action) => {
                        const tooltipId = `${action.key}-${bundle.id}`;
                        const isModalAction =
                            action.key === "delete" ||
                            (action.key === "duplicate" && canDuplicate);

                        if (action.key === "view") {
                            return (
                                <s-button
                                    key={action.key}
                                    slot="secondary-actions"
                                    interestFor={tooltipId}
                                    commandFor={popoverId}
                                    accessibilityLabel={t(action.key)}
                                    icon={action.icon}
                                    tone={action.tone}
                                />
                            );
                        }

                        return (
                            <s-button
                                key={action.key}
                                slot="secondary-actions"
                                interestFor={tooltipId}
                                accessibilityLabel={t(action.key)}
                                icon={action.icon}
                                tone={action.tone}
                                {...(isModalAction
                                    ? {
                                          commandFor:
                                              "radius-bundles-app-modal",
                                          command: "--show",
                                      }
                                    : {})}
                                onClick={() => handleActionClick(action.key)}
                            />
                        );
                    })}
                </s-button-group>

                {!canDuplicate && (
                    <span className="opacity-40">
                        <s-button
                            slot="secondary-actions"
                            interestFor={`duplicate-${bundle.id}`}
                            accessibilityLabel={`${t("duplicate")} (Pro)`}
                            icon="duplicate"
                            onClick={() => handleActionClick("duplicate")}
                        />
                    </span>
                )}
            </s-stack>
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
