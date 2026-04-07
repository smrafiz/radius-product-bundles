"use client";

import {
    BUNDLE_STATUSES,
    useBundleField,
    useBundleStore,
    type VolumeDiscountConfig,
    type VolumeTier,
} from "@/features/bundles";
import { useState } from "react";
import { formatDateLong, getCurrencySymbol, useShopSettings } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

function formatTierDiscount(
    tier: VolumeTier,
    discountType: "PERCENTAGE" | "FIXED_AMOUNT",
    currencySymbol: string,
): string {
    if (discountType === "PERCENTAGE") return `${tier.discount}% off`;
    return `${currencySymbol}${tier.discount.toFixed(2)} off`;
}

export function VolumeReviewSection() {
    const t = useTranslations("Bundles.Creation.Review");
    const ts = useTranslations("Bundles.Statuses");
    const { bundleData, selectedItems } = useBundleStore();
    const { currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);
    const [open, setOpen] = useState(true);

    const nameField = useBundleField<string>("name");
    const descriptionField = useBundleField<string>("description");

    const config = bundleData.volumeTiers as VolumeDiscountConfig | undefined;
    const tiers = config?.tiers ?? [];
    const discountType = config?.discountType ?? "PERCENTAGE";
    const openEnded = config?.openEnded ?? true;

    const statusInfo = bundleData.status
        ? BUNDLE_STATUSES[bundleData.status]
        : BUNDLE_STATUSES.DRAFT;

    const toDate = (value: Date | string | undefined): Date | undefined => {
        if (!value) return undefined;
        return value instanceof Date ? value : new Date(value);
    };

    const formatDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return t("notSet");
        return formatDateLong(dateObj.toISOString().split("T")[0]);
    };

    return (
        <s-stack gap="base">
            {/* Title + Description */}
            <s-section>
                <s-stack gap="small">
                    <s-stack>
                        <s-heading>{t("title")}</s-heading>
                        <s-text color="subdued">
                            {nameField.value || t("notSet")}
                        </s-text>
                    </s-stack>
                    <s-stack>
                        <s-heading>{t("description")}</s-heading>
                        <div className="block">
                            <s-paragraph color="subdued">
                                {descriptionField.value || t("notSet")}
                            </s-paragraph>
                        </div>
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Volume Tiers */}
            <s-section>
                <s-stack gap="small">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Volume Discount Tiers</s-heading>
                        <s-badge tone="info">
                            {discountType === "PERCENTAGE"
                                ? "Percentage"
                                : "Fixed Amount"}
                        </s-badge>
                    </s-stack>

                    {tiers.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {tiers.map((tier, index) => {
                                const isLast = index === tiers.length - 1;
                                const nextMin = tiers[index + 1]?.minQuantity;
                                const maxQty = isLast
                                    ? null
                                    : (nextMin ?? 0) - 1;
                                const rangeLabel = isLast
                                    ? openEnded
                                        ? `Buy ${tier.minQuantity}+`
                                        : `Buy ${tier.minQuantity}`
                                    : maxQty === tier.minQuantity
                                      ? `Buy ${tier.minQuantity}`
                                      : `Buy ${tier.minQuantity}+`;

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-800">
                                                {rangeLabel}
                                            </span>
                                            {tier.isDefault && (
                                                <s-badge tone="success">
                                                    Pre-selected
                                                </s-badge>
                                            )}
                                            {tier.badge?.style &&
                                                tier.badge.style !== "none" && (
                                                    <s-badge tone="warning">
                                                        {tier.badge.text ??
                                                            tier.badge.style}
                                                    </s-badge>
                                                )}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatTierDiscount(
                                                tier,
                                                discountType,
                                                currencySymbol,
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <s-text color="subdued">No tiers configured.</s-text>
                    )}

                    {openEnded && tiers.length > 0 && (
                        <s-text color="subdued">
                            Last tier discount applies to all quantities above
                            the maximum.
                        </s-text>
                    )}
                </s-stack>
            </s-section>

            {/* Status */}
            <s-section>
                <s-stack gap="small">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-heading>{t("status")}</s-heading>
                        <s-badge tone={statusInfo.tone}>
                            {ts(bundleData.status ?? "DRAFT")}
                        </s-badge>
                    </s-stack>
                    {bundleData.status === "SCHEDULED" && (
                        <s-stack gap="small-200">
                            <s-stack
                                alignItems="center"
                                justifyContent="space-between"
                                direction="inline"
                            >
                                <s-text color="subdued">
                                    {t("startDate")}
                                </s-text>
                                <s-text>
                                    {formatDate(bundleData.startDate)}
                                </s-text>
                            </s-stack>
                            <s-stack
                                alignItems="center"
                                justifyContent="space-between"
                                direction="inline"
                            >
                                <s-text color="subdued">{t("endDate")}</s-text>
                                <s-text>
                                    {formatDate(bundleData.endDate)}
                                </s-text>
                            </s-stack>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>

            {/* Products */}
            <s-section>
                <s-stack>
                    <div
                        className="cursor-pointer z-30"
                        onClick={() => setOpen(!open)}
                    >
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="small"
                            aria-expanded={open}
                        >
                            <s-heading>
                                {t("selectedProducts")} ({selectedItems.length})
                            </s-heading>
                            <s-icon
                                type={open ? "chevron-up" : "chevron-down"}
                            />
                        </s-stack>
                    </div>

                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-250 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <s-stack gap="small" paddingBlockStart="small">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((p) => (
                                    <s-box
                                        key={p.id}
                                        padding="small"
                                        background="subdued"
                                        border="base"
                                        borderRadius="base"
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="base"
                                            alignItems="center"
                                        >
                                            {p.image ? (
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                                    <s-image
                                                        src={p.image}
                                                        alt={p.title}
                                                        aspectRatio="40/40"
                                                        inlineSize="auto"
                                                        loading="lazy"
                                                        objectFit="cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                                    <s-icon
                                                        type="image"
                                                        tone="neutral"
                                                    />
                                                </div>
                                            )}
                                            <s-text>
                                                {p.title.replace(/ - .+$/, "")}
                                            </s-text>
                                        </s-stack>
                                    </s-box>
                                ))
                            ) : (
                                <s-text color="subdued">{t("notSet")}</s-text>
                            )}
                        </s-stack>
                    </div>
                </s-stack>
            </s-section>
        </s-stack>
    );
}
