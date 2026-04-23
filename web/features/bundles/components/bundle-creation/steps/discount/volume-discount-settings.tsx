"use client";

import {
    VOLUME_TIER_DEFAULT_TITLE,
    useVolumeDiscount,
    type VolumeBadgeStyle,
    type VolumeTier,
} from "@/features/bundles";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";

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
    t,
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
    t: (key: string, values?: Record<string, string | number>) => string;
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
                        <s-heading>{t("tier", { number: index + 1 })}</s-heading>
                        {(qtyError || discountError || titleError) && (
                            <s-icon type="alert-circle" tone="critical" aria-label={t("tierHasErrors")} />
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
                                accessibilityLabel={t("removeTier", { number: index + 1 })}
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
                                            label={t("minQuantity")}
                                            value={String(
                                                tier.minQuantity ?? "",
                                            )}
                                            details={t("minQuantityDetails")}
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
                                            label={t("discount", { suffix })}
                                            value={
                                                tier.discount !== undefined
                                                    ? String(tier.discount)
                                                    : ""
                                            }
                                            step={0.01}
                                            min={0}
                                            suffix={suffix}
                                            details={t("discountDetails")}
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
                                    label={t("tierTitle")}
                                    value={tier.title ?? VOLUME_TIER_DEFAULT_TITLE}
                                    maxLength={50}
                                    details={t("tierTitleDetails")}
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
                                        <s-heading>{t("optionalSettings")}</s-heading>
                                    </s-stack>
                                </div>

                                <div
                                    className={`grid transition-[grid-template-rows,margin] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr] -mb-4"}`}
                                >
                                    <div className="overflow-hidden px-0.75 -mx-0.75">
                                        <s-stack gap="base">
                                            <s-text-field
                                                label={t("subtitle")}
                                                value={tier.subtitle ?? ""}
                                                maxLength={80}
                                                details={t("subtitleDetails")}
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
                                                        label={t("badgeStyle")}
                                                        value={
                                                            tier.badge
                                                                ?.style ??
                                                            "none"
                                                        }
                                                        details={t("badgeStyleDetails")}
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
                                                        {(["none", "popular", "best-value", "custom"] as VolumeBadgeStyle[]).map(
                                                            (val) => (
                                                                <s-option
                                                                    key={val}
                                                                    value={val}
                                                                >
                                                                    {t(`badgeStyles.${val}`)}
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
                                                                label={t("badgeText")}
                                                                value={
                                                                    tier.badge
                                                                        ?.text ??
                                                                    ""
                                                                }
                                                                maxLength={30}
                                                                details={t("badgeTextDetails")}
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
                                                label={t("preselect")}
                                                details={t("preselectDetails")}
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
    const t = useTranslations("Bundles.Creation.Discount.VolumeDiscount");
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
                        <s-heading>{t("heading")}</s-heading>
                        <s-tooltip id="discount-settings-tooltip">
                            <s-text>{t("tooltip")}</s-text>
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
                        <s-text type="strong">{t("discountType")}</s-text>
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
                                    {t("percentage")}
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
                                    {t("fixedAmount", { currency: currencySymbol })}
                                </span>
                            </s-button>
                        </s-button-group>
                    </s-stack>
                    <s-divider />
                    <s-switch
                        label={t("openEnded")}
                        details={t("openEndedDetails")}
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
                    t={t}
                />
            ))}

            {atLimit && (
                <s-banner tone="info">{t("maxTiersReached")}</s-banner>
            )}

            <s-button
                variant="primary"
                icon="plus"
                onClick={addTier}
                disabled={atLimit}
            >
                {t("addTier")}
            </s-button>
        </s-stack>
    );
}
