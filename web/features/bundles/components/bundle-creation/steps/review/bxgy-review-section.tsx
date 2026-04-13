"use client";

import {
    BUNDLE_STATUSES,
    bundleCurrencyFormatter,
    DISCOUNT_TYPES,
    DiscountType,
    formatDiscountFromValues,
    useBundleField,
    useBundleStore,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useMemo, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { formatDateLong, useShopSettings } from "@/shared";

export function BxgyReviewSection() {
    const ts = useTranslations("Bundles.Statuses");
    const t = useTranslations("Bundles.Creation.Review");
    const { bundleData, getTriggerProducts, getRewardProducts } =
        useBundleStore(
            useShallow((s) => ({
                bundleData: s.bundleData,
                getTriggerProducts: s.getTriggerProducts,
                getRewardProducts: s.getRewardProducts,
            })),
        );
    const { isLoading, currencyCode } = useShopSettings();
    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);

    const nameField = useBundleField<string>("name");
    const descriptionField = useBundleField<string>("description");
    const discountTypeField = useBundleField<string>("discountType");
    const discountValueField = useBundleField<number | undefined>(
        "discountValue",
    );

    const [open, setOpen] = useState(true);

    const triggerProducts = getTriggerProducts();
    const rewardProducts = getRewardProducts();
    const discountType = bundleData.discountType as DiscountType;
    const discountValue = bundleData.discountValue;
    const buyQty = bundleData.buyQuantity ?? 1;
    const getQty = bundleData.getQuantity ?? 1;

    const formatDiscount = () =>
        formatDiscountFromValues(
            discountTypeField.value as DiscountType,
            discountValueField.value,
            currencyFormatter,
        );

    const toDate = (value: Date | string | undefined): Date | undefined => {
        if (!value) return undefined;
        return value instanceof Date ? value : new Date(value);
    };

    const formatDate = (date: Date | string | undefined): string => {
        const dateObj = toDate(date);
        if (!dateObj) return t("notSet");
        return formatDateLong(dateObj.toISOString().split("T")[0]);
    };

    const statusInfo = bundleData.status
        ? BUNDLE_STATUSES[bundleData.status]
        : BUNDLE_STATUSES.DRAFT;

    let discountLabel = "";
    if (discountType === "NO_DISCOUNT" || !discountType) {
        discountLabel = t("atFullPrice");
    } else if (discountType === "PERCENTAGE" && discountValue) {
        discountLabel =
            discountValue === 100 ? t("free") : `at ${discountValue}% off`;
    } else if (discountType === "FIXED_AMOUNT" && discountValue) {
        discountLabel = `at ${currencyFormatter(discountValue)} off`;
    } else if (discountType === "CUSTOM_PRICE" && discountValue) {
        discountLabel = `for ${currencyFormatter(discountValue)} each`;
    } else {
        discountLabel = "at a discount";
    }

    const round = (n: number) => Math.round(n * 100) / 100;

    const triggerTotal = useMemo(
        () =>
            round(
                triggerProducts.reduce(
                    (sum, p) =>
                        sum + parseFloat(p.price || "0") * (p.quantity || 1),
                    0,
                ),
            ),
        [triggerProducts],
    );

    const rewardTotal = useMemo(
        () =>
            round(
                rewardProducts.reduce(
                    (sum, p) =>
                        sum + parseFloat(p.price || "0") * (p.quantity || 1),
                    0,
                ),
            ),
        [rewardProducts],
    );

    const subtotal = round(triggerTotal + rewardTotal);

    const discount = useMemo(() => {
        if (!discountValue) return 0;
        if (discountType === "PERCENTAGE")
            return round(rewardTotal * (discountValue / 100));
        if (discountType === "FIXED_AMOUNT")
            return round(Math.min(discountValue, rewardTotal));
        if (discountType === "CUSTOM_PRICE")
            return round(Math.max(0, rewardTotal - discountValue));
        return 0;
    }, [discountType, discountValue, rewardTotal]);

    const total = round(Math.max(0, subtotal - discount));

    const triggerNames = triggerProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");
    const rewardNames = rewardProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");

    const getRewardPrice = (originalPrice: number) => {
        if (!discountValue) return originalPrice;
        if (discountType === "PERCENTAGE")
            return round(originalPrice * (1 - discountValue / 100));
        if (discountType === "FIXED_AMOUNT")
            return round(Math.max(0, originalPrice - discountValue));
        if (discountType === "CUSTOM_PRICE") return round(discountValue);
        return originalPrice;
    };

    const renderProductCard = (
        p: (typeof triggerProducts)[0],
        role: "TRIGGER" | "REWARD",
    ) => {
        const originalPrice = parseFloat(p.price || "0");
        const isReward = role === "REWARD";
        const finalPrice = isReward
            ? getRewardPrice(originalPrice)
            : originalPrice;
        const hasDiscount =
            isReward &&
            discountType &&
            discountValue &&
            finalPrice !== originalPrice;

        return (
            <s-box
                key={`${p.productId}-${role}`}
                padding="small"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="base"
                >
                    <s-stack gap="base" direction="inline">
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
                                <s-icon type="image" tone="neutral" />
                            </div>
                        )}
                        <s-stack
                            direction="inline"
                            gap="small"
                            alignItems="center"
                        >
                            <s-heading>
                                {p.title.replace(/ - .+$/, "")}
                            </s-heading>
                            <s-badge
                                tone={role === "TRIGGER" ? "info" : "success"}
                            >
                                {role === "TRIGGER"
                                    ? t("customerBuys")
                                    : t("customerGets")}
                            </s-badge>
                        </s-stack>
                    </s-stack>
                    {p.price && (
                        <s-stack
                            direction="inline"
                            gap="small"
                            alignItems="center"
                        >
                            {hasDiscount && (
                                <s-text tone="neutral">
                                    <s
                                        style={{
                                            textDecoration: "line-through",
                                        }}
                                    >
                                        {currencyFormatter(originalPrice)}
                                    </s>
                                </s-text>
                            )}
                            <s-text type="strong">
                                {hasDiscount
                                    ? finalPrice === 0
                                        ? t("free")
                                        : currencyFormatter(finalPrice)
                                    : currencyFormatter(originalPrice)}
                            </s-text>
                        </s-stack>
                    )}
                </s-stack>
            </s-box>
        );
    };

    return (
        <s-stack gap="base">
            {/* Title Section */}
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

            {/* Deal Summary */}
            <s-section>
                <s-stack gap="small">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-heading>{t("deal")}</s-heading>
                        <s-text color="subdued">
                            Buy {buyQty} × {triggerNames || "—"} → Get {getQty}{" "}
                            × {rewardNames || "—"} {discountLabel}
                        </s-text>
                    </s-stack>
                    {bundleData.sameProductMode && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                        >
                            <s-heading>{t("mode")}</s-heading>
                            <s-badge tone="info">
                                {t("sameProductDeal")}
                            </s-badge>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>

            {/* Discount Section */}
            <s-section>
                <s-stack gap="small-300">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                        gap="small-300"
                    >
                        <s-heading>{t("discountType")}</s-heading>
                        <s-text color="subdued">
                            {discountType
                                ? DISCOUNT_TYPES[
                                      discountType as keyof typeof DISCOUNT_TYPES
                                  ]?.label
                                : t("notSet")}
                        </s-text>
                    </s-stack>
                    {discountType !== "NO_DISCOUNT" && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                            gap="small-300"
                        >
                            <s-heading>{t("discountValue")}</s-heading>
                            <s-text color="subdued">
                                {isLoading ? "•" : formatDiscount()}
                            </s-text>
                        </s-stack>
                    )}
                    {bundleData.freeShipping && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                            gap="small-300"
                        >
                            <s-heading>{t("freeShipping")}</s-heading>
                            <s-text color="subdued">Yes</s-text>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>

            {/* Status Section */}
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

            {/* Products Section */}
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
                                {t("selectedProducts")} (
                                {triggerProducts.length + rewardProducts.length}
                                )
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
                            {triggerProducts.length > 0 && (
                                <s-stack gap="small-200">
                                    {triggerProducts.map((p) =>
                                        renderProductCard(p, "TRIGGER"),
                                    )}
                                </s-stack>
                            )}
                            {rewardProducts.length > 0 && (
                                <s-stack gap="small-200">
                                    {rewardProducts.map((p) =>
                                        renderProductCard(p, "REWARD"),
                                    )}
                                </s-stack>
                            )}
                        </s-stack>
                    </div>
                </s-stack>
            </s-section>

            {/* Pricing Section */}
            <s-section>
                <s-stack gap="small">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text>{t("subtotal")}</s-text>
                        <s-text>{currencyFormatter(subtotal)}</s-text>
                    </s-stack>
                    {discount > 0 && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                        >
                            <s-text>{t("discount")}</s-text>
                            <s-text>- {currencyFormatter(discount)}</s-text>
                        </s-stack>
                    )}
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-text type="strong">{t("total")}</s-text>
                        <s-text type="strong">
                            {currencyFormatter(total)}
                        </s-text>
                    </s-stack>
                </s-stack>
            </s-section>
        </s-stack>
    );
}
