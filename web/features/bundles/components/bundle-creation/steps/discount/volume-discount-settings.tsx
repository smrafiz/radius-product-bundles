"use client";

import {
    VOLUME_TIER_DEFAULT_TITLE,
    useVolumeDiscount,
    type VolumeBadgeStyle,
    type VolumeTier,
} from "@/features/bundles";
import { useState } from "react";

const BADGE_STYLES: { label: string; value: VolumeBadgeStyle }[] = [
    { label: "None", value: "none" },
    { label: "Most Popular", value: "popular" },
    { label: "Best Value", value: "best-value" },
    { label: "Custom", value: "custom" },
];

function VolumeTierCard({
    tier,
    index,
    isOnly,
    discountType,
    currencySymbol,
    initialCollapsed,
    qtyError,
    discountError,
    titleError,
    onUpdate,
    onRemove,
}: {
    tier: VolumeTier;
    index: number;
    isOnly: boolean;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    currencySymbol: string;
    initialCollapsed?: boolean;
    qtyError?: string;
    discountError?: string;
    titleError?: string;
    onUpdate: (index: number, updates: Partial<VolumeTier>) => void;
    onRemove: (index: number) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);

    const suffix = discountType === "PERCENTAGE" ? "%" : currencySymbol;
    const summary =
        tier.minQuantity != null && tier.discount != null
            ? `Buy ${tier.minQuantity}+, get ${tier.discount}${suffix} off`
            : null;

    return (
        <s-section>
            <s-stack gap="base">
                <div
                    className="cursor-pointer flex items-center justify-between"
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapsed}
                    onClick={() => setCollapsed(!collapsed)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCollapsed(!collapsed);
                        }
                    }}
                >
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                    >
                        <s-icon
                            type={collapsed ? "chevron-right" : "chevron-down"}
                        />
                        <s-heading>Tier {index + 1}</s-heading>
                        {(qtyError || discountError || titleError) && (
                            <s-icon type="alert-circle" tone="critical" />
                        )}
                    </s-stack>
                    <s-stack direction="inline" gap="base" alignItems="center">
                        {collapsed && summary && (
                            <s-badge tone="info">{summary}</s-badge>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                            <s-button
                                variant="secondary"
                                tone="critical"
                                icon="delete"
                                disabled={isOnly}
                                onClick={() => onRemove(index)}
                                accessibilityLabel={`Remove tier ${index + 1}`}
                            />
                        </div>
                    </s-stack>
                </div>

                <div
                    className={`grid transition-[grid-template-rows,margin] duration-300 ease-in-out ${collapsed ? "grid-rows-[0fr] -mb-4" : "grid-rows-[1fr]"}`}
                >
                    <div className="overflow-hidden px-0.75 -mx-0.75">
                        <div className="-mx-5 border-t border-gray-200" />
                        <div className="pt-4">
                            <s-stack gap="base">
                                <s-stack direction="inline" gap="base">
                                    <div className="flex-1">
                                        <s-number-field
                                            required
                                            label="Min Quantity"
                                            value={String(
                                                tier.minQuantity ?? "",
                                            )}
                                            details="Minimum items a customer must add to cart."
                                            error={qtyError}
                                            onInput={(e: Event) => {
                                                const val = parseInt(
                                                    (e.target as HTMLInputElement).value,
                                                    10,
                                                );
                                                onUpdate(index, { minQuantity: val });
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <s-number-field
                                            required
                                            label={`Discount (${suffix})`}
                                            value={
                                                tier.discount !== undefined
                                                    ? String(tier.discount)
                                                    : ""
                                            }
                                            suffix={suffix}
                                            details="Discount applied when this tier is activated."
                                            error={discountError}
                                            onInput={(e: Event) => {
                                                const val = parseFloat(
                                                    (e.target as HTMLInputElement).value,
                                                );
                                                onUpdate(index, { discount: val });
                                            }}
                                        />
                                    </div>
                                </s-stack>

                                <s-text-field
                                    required
                                    label="Title"
                                    value={tier.title ?? VOLUME_TIER_DEFAULT_TITLE}
                                    maxLength={50}
                                    details={`Shown on the storefront. Use {quantity} and {discount} as dynamic variables.`}
                                    error={titleError}
                                    onInput={(e: Event) => {
                                        onUpdate(index, {
                                            title: (
                                                e.target as HTMLInputElement
                                            ).value,
                                        });
                                    }}
                                />

                                <s-divider />

                                <div
                                    className="cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={expanded}
                                    onClick={() => setExpanded(!expanded)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setExpanded(!expanded);
                                        }
                                    }}
                                >
                                    <s-stack
                                        direction="inline"
                                        gap="small-200"
                                        alignItems="center"
                                    >
                                        <s-icon
                                            type={
                                                expanded
                                                    ? "chevron-up"
                                                    : "chevron-down"
                                            }
                                        />
                                        <s-heading>Optional Settings</s-heading>
                                    </s-stack>
                                </div>

                                <div
                                    className={`grid transition-[grid-template-rows,margin] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr] -mb-4"}`}
                                >
                                    <div className="overflow-hidden px-0.75 -mx-0.75">
                                        <s-stack gap="base">
                                            <s-text-field
                                                label="Subtitle"
                                                value={tier.subtitle ?? ""}
                                                maxLength={80}
                                                details="Secondary text shown below the title on the storefront."
                                                onInput={(e: Event) => {
                                                    onUpdate(index, {
                                                        subtitle:
                                                            (
                                                                e.target as HTMLInputElement
                                                            ).value ||
                                                            undefined,
                                                    });
                                                }}
                                            />

                                            <s-stack
                                                direction="inline"
                                                gap="base"
                                            >
                                                <div className="flex-1">
                                                    <s-select
                                                        label="Badge Style"
                                                        value={
                                                            tier.badge
                                                                ?.style ??
                                                            "none"
                                                        }
                                                        details="Highlight label displayed on this tier option."
                                                        onInput={(
                                                            e: Event,
                                                        ) => {
                                                            const style = (
                                                                e.target as HTMLSelectElement
                                                            )
                                                                .value as VolumeBadgeStyle;
                                                            onUpdate(
                                                                index,
                                                                {
                                                                    badge:
                                                                        style ===
                                                                        "none"
                                                                            ? undefined
                                                                            : {
                                                                                  style,
                                                                                  text: tier
                                                                                      .badge
                                                                                      ?.text,
                                                                              },
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        {BADGE_STYLES.map(
                                                            (opt) => (
                                                                <s-option
                                                                    key={
                                                                        opt.value
                                                                    }
                                                                    value={
                                                                        opt.value
                                                                    }
                                                                >
                                                                    {
                                                                        opt.label
                                                                    }
                                                                </s-option>
                                                            ),
                                                        )}
                                                    </s-select>
                                                </div>

                                                {tier.badge?.style &&
                                                    tier.badge.style !==
                                                        "none" && (
                                                        <div className="flex-1">
                                                            <s-text-field
                                                                label="Badge Text"
                                                                value={
                                                                    tier.badge
                                                                        ?.text ??
                                                                    ""
                                                                }
                                                                maxLength={30}
                                                                details="Label text shown inside the badge."
                                                                onInput={(
                                                                    e: Event,
                                                                ) => {
                                                                    onUpdate(
                                                                        index,
                                                                        {
                                                                            badge: {
                                                                                style: tier
                                                                                    .badge!
                                                                                    .style,
                                                                                text:
                                                                                    (
                                                                                        e.target as HTMLInputElement
                                                                                    )
                                                                                        .value ||
                                                                                    undefined,
                                                                            },
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                            </s-stack>

                                            <s-switch
                                                label="Pre-select this tier for customers"
                                                details="This tier will be selected by default when customers view the bundle."
                                                checked={
                                                    tier.isDefault ?? false
                                                }
                                                onInput={(e: Event) => {
                                                    onUpdate(index, {
                                                        isDefault: (
                                                            e.target as HTMLInputElement
                                                        ).checked,
                                                    });
                                                }}
                                            />
                                        </s-stack>
                                    </div>
                                </div>
                            </s-stack>
                        </div>
                    </div>
                </div>
            </s-stack>
        </s-section>
    );
}

export function VolumeDiscountSettings() {
    const {
        config,
        currencySymbol,
        lastAddedIndex,
        tierFieldErrors,
        atLimit,
        updateConfig,
        updateTier,
        addTier,
        removeTier,
    } = useVolumeDiscount();

    return (
        <s-stack gap="base">
            {/* Global controls */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Discount Settings</s-heading>
                        <s-tooltip id="discount-settings-tooltip">
                            <s-text>
                                Set how discounts scale with quantity. Each tier
                                applies a discount when the customer buys at
                                least the specified quantity.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="discount-settings-tooltip"
                        />
                    </s-stack>

                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-text type="strong">Discount Type</s-text>
                        <s-button-group gap="none">
                            <s-button
                                slot="secondary-actions"
                                variant="secondary"
                                aria-pressed={config.discountType === "PERCENTAGE"}
                                onClick={() =>
                                    updateConfig({ discountType: "PERCENTAGE" })
                                }
                            >
                                <span
                                    className={
                                        config.discountType === "PERCENTAGE"
                                            ? "text-[#0094d5]"
                                            : ""
                                    }
                                >
                                    Percentage %
                                </span>
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                variant="secondary"
                                aria-pressed={config.discountType === "FIXED_AMOUNT"}
                                onClick={() =>
                                    updateConfig({
                                        discountType: "FIXED_AMOUNT",
                                    })
                                }
                            >
                                <span
                                    className={
                                        config.discountType === "FIXED_AMOUNT"
                                            ? "text-[#0094d5]"
                                            : ""
                                    }
                                >
                                    Fixed Amount {currencySymbol}
                                </span>
                            </s-button>
                        </s-button-group>
                    </s-stack>
                    <s-divider />
                    <s-switch
                        label="Open-ended top tier"
                        details="Apply the last tier's discount to all quantities above the maximum."
                        checked={config.openEnded ?? true}
                        onInput={(e: Event) => {
                            updateConfig({
                                openEnded: (e.target as HTMLInputElement)
                                    .checked,
                            });
                        }}
                    />
                </s-stack>
            </s-section>

            {/* Tier cards */}
            {config.tiers.map((tier, index) => (
                <VolumeTierCard
                    key={tier.id ?? index}
                    tier={tier}
                    index={index}
                    isOnly={config.tiers.length === 1}
                    discountType={config.discountType}
                    currencySymbol={currencySymbol}
                    initialCollapsed={index > 0 && index !== lastAddedIndex}
                    qtyError={tierFieldErrors[index]?.minQuantity}
                    discountError={tierFieldErrors[index]?.discount}
                    titleError={tierFieldErrors[index]?.title}
                    onUpdate={updateTier}
                    onRemove={removeTier}
                />
            ))}

            {atLimit && (
                <s-banner tone="info">Maximum of 10 tiers reached.</s-banner>
            )}

            <s-button
                variant="primary"
                icon="plus"
                onClick={addTier}
                disabled={atLimit}
            >
                Add Tier
            </s-button>
        </s-stack>
    );
}
