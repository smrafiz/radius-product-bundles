"use client";

import { useState } from "react";
import {
    DISCOUNT_TYPES,
    DiscountType,
    formatDiscountFromValues,
    bundleCurrencyFormatter,
    useBundleStore,
} from "@/features/bundles";
import { useShopSettings } from "@/shared";

export function BxgyReviewSection() {
    const { bundleData, getTriggerProducts, getRewardProducts } =
        useBundleStore();
    const { isLoading, currencyCode } = useShopSettings();
    const currencyFormatter = bundleCurrencyFormatter(currencyCode, isLoading);

    const [open, setOpen] = useState(true);

    const triggerProducts = getTriggerProducts();
    const rewardProducts = getRewardProducts();
    const discountType = bundleData.discountType as DiscountType;
    const discountValue = bundleData.discountValue;
    const usesPerOrderLimit = bundleData.usesPerOrderLimit;

    let discountLabel = "at a discount";
    if (discountType === "PERCENTAGE" && discountValue) {
        discountLabel =
            discountValue === 100 ? "FREE" : `at ${discountValue}% off`;
    } else if (discountType === "FIXED_AMOUNT" && discountValue) {
        discountLabel = `at $${discountValue} off`;
    } else if (discountType === "CUSTOM_PRICE" && discountValue) {
        discountLabel = `for $${discountValue} each`;
    } else if (discountType === "NO_DISCOUNT") {
        discountLabel = "at full price";
    }

    const triggerNames = triggerProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");
    const rewardNames = rewardProducts
        .map((p) => p.title.replace(/ - .+$/, ""))
        .join(", ");

    return (
        <s-stack gap="base">
            <s-box
                padding="base"
                background="subdued"
                border="base"
                borderRadius="base"
            >
                <s-stack gap="small">
                    <s-heading>Deal Summary</s-heading>
                    <s-text type="strong">
                        Buy 1 × {triggerNames || "—"} → Get 1 ×{" "}
                        {rewardNames || "—"} {discountLabel}
                    </s-text>
                    {usesPerOrderLimit && (
                        <s-text tone="neutral">
                            Limited to {usesPerOrderLimit} use
                            {usesPerOrderLimit > 1 ? "s" : ""} per order
                        </s-text>
                    )}
                    {bundleData.sameProductMode && (
                        <s-badge tone="info">Same product deal</s-badge>
                    )}
                </s-stack>
            </s-box>

            <div className="cursor-pointer z-30" onClick={() => setOpen(!open)}>
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                >
                    <s-heading>
                        Products ({triggerProducts.length + rewardProducts.length}
                        )
                    </s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
            >
                <s-stack gap="base" paddingBlockStart="small">
                    {triggerProducts.length > 0 && (
                        <s-stack gap="small-200">
                            <s-text type="strong">Customer buys</s-text>
                            {triggerProducts.map((p) => (
                                <s-box
                                    key={p.productId}
                                    padding="small"
                                    background="subdued"
                                    border="base"
                                    borderRadius="base"
                                >
                                    <s-stack
                                        direction="inline"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="small"
                                            alignItems="center"
                                        >
                                            {p.image ? (
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                                    <s-image
                                                        src={p.image}
                                                        alt={p.title}
                                                        aspectRatio="40/40"
                                                        inlineSize="auto"
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
                                            <s-heading>
                                                {p.title.replace(/ - .+$/, "")}
                                            </s-heading>
                                            <s-badge tone="info">
                                                TRIGGER
                                            </s-badge>
                                        </s-stack>
                                        <s-text>
                                            {p.price ? `$${p.price}` : "—"}
                                        </s-text>
                                    </s-stack>
                                </s-box>
                            ))}
                        </s-stack>
                    )}

                    {rewardProducts.length > 0 && (
                        <s-stack gap="small-200">
                            <s-text type="strong">Customer gets</s-text>
                            {rewardProducts.map((p) => (
                                <s-box
                                    key={p.productId}
                                    padding="small"
                                    background="subdued"
                                    border="base"
                                    borderRadius="base"
                                >
                                    <s-stack
                                        direction="inline"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="small"
                                            alignItems="center"
                                        >
                                            {p.image ? (
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                                    <s-image
                                                        src={p.image}
                                                        alt={p.title}
                                                        aspectRatio="40/40"
                                                        inlineSize="auto"
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
                                            <s-heading>
                                                {p.title.replace(/ - .+$/, "")}
                                            </s-heading>
                                            <s-badge tone="success">
                                                REWARD
                                            </s-badge>
                                        </s-stack>
                                        <s-text>
                                            {p.price
                                                ? `$${p.price} → ${discountLabel}`
                                                : discountLabel}
                                        </s-text>
                                    </s-stack>
                                </s-box>
                            ))}
                        </s-stack>
                    )}
                </s-stack>
            </div>

            <s-section>
                <s-stack gap="small">
                    <s-stack
                        alignItems="center"
                        justifyContent="space-between"
                        direction="inline"
                    >
                        <s-heading>Discount</s-heading>
                        <s-text>
                            {discountType
                                ? DISCOUNT_TYPES[
                                      discountType as keyof typeof DISCOUNT_TYPES
                                  ]?.label
                                : "Not set"}{" "}
                            —{" "}
                            {isLoading
                                ? "•"
                                : formatDiscountFromValues(
                                      discountType,
                                      discountValue,
                                      currencyFormatter,
                                  )}
                        </s-text>
                    </s-stack>
                    {usesPerOrderLimit && (
                        <s-stack
                            alignItems="center"
                            justifyContent="space-between"
                            direction="inline"
                        >
                            <s-text tone="neutral">Stacking limit</s-text>
                            <s-text>
                                {usesPerOrderLimit} per order
                            </s-text>
                        </s-stack>
                    )}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
