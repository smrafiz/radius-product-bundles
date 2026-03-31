"use client";

import { useDiscountSettings } from "@/features/bundles/hooks/ui/use-discount-settings";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore } from "@/shared";
import { useState } from "react";

/**
 * Discount settings configuration component
 */
export function DiscountSettings() {
    const t = useTranslations("Bundles.Creation.Discount");
    const {
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountAmount,
        availableDiscountTypes,
        isDiscountTypeLocked,
        handleDiscountTypeChange,
        handleDiscountValueChange,
        handleMinOrderValueChange,
        handleMaxDiscountAmountChange,
        createBlurHandler,
        getDiscountValueLabel,
        getCurrency,
        getSuffix,
        getPrefix,
        getFieldError,
        showDiscountValue,
        showMaxDiscountAmount,
    } = useDiscountSettings();
    const { open: openCrossSell } = useCrossSellStore();
    const [isOpen, setIsOpen] = useState(false);
    const popoverId = "discount-type-popover";
    const selectedLabel =
        availableDiscountTypes.find((c) => c.id === discountType)?.label ??
        t("selectType");

    return (
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

            <s-stack gap="small-200">
                <s-text>{t("discountType")}</s-text>
                <div
                    className={`relative ${isOpen ? "rtpb-active-shadow" : "rtpb-normal-shadow"}`}
                >
                    <s-clickable
                        command="--toggle"
                        commandFor={popoverId}
                        borderWidth="small"
                        borderColor="strong"
                        borderRadius="base"
                        padding="small-300"
                        paddingInline="small"
                        type="submit"
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        <div className="w-full flex justify-between items-center">
                            <s-text>
                                <div className="font-[550]">
                                    {selectedLabel}
                                </div>
                            </s-text>
                            <div className="flex flex-col relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 fill-[rgba(97,97,97,1)]"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path d="M8.884 2.323a1.25 1.25 0 0 0-1.768 0l-2.646 2.647a.749.749 0 1 0 1.06 1.06l2.47-2.47 2.47 2.47a.749.749 0 1 0 1.06-1.06z" />
                                    <path d="m11.53 11.03-2.646 2.647a1.25 1.25 0 0 1-1.768 0l-2.646-2.647a.749.749 0 1 1 1.06-1.06l2.47 2.47 2.47-2.47a.749.749 0 1 1 1.06 1.06" />
                                </svg>
                            </div>
                        </div>
                    </s-clickable>
                </div>

                <s-popover id={popoverId}>
                    <div className="p-2 w-100">
                        <s-stack gap="small-400">
                            {availableDiscountTypes.map((config) => {
                                const isSelected = config.id === discountType;
                                const isLocked = isDiscountTypeLocked(
                                    config.id,
                                );

                                return (
                                    <s-clickable
                                        key={config.id}
                                        command={
                                            isLocked ? undefined : "--hide"
                                        }
                                        commandFor={
                                            isLocked ? undefined : popoverId
                                        }
                                        borderRadius="base"
                                        onClick={() => {
                                            if (isLocked) {
                                                openCrossSell(config.label);
                                            } else {
                                                handleDiscountTypeChange(
                                                    config.id,
                                                );
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <div
                                            className={`py-1 px-2 rounded-md transition-colors ${
                                                isLocked
                                                    ? "rtpb-pro-locked"
                                                    : isSelected
                                                      ? "bg-[#ebebeb]"
                                                      : "hover:bg-[#f7f7f7]"
                                            }`}
                                        >
                                            <s-stack
                                                gap="none"
                                                direction="inline"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <s-stack gap="none">
                                                    <s-heading>
                                                        {config.label}
                                                    </s-heading>
                                                    <s-paragraph color="subdued">
                                                        {config.description}
                                                    </s-paragraph>
                                                </s-stack>
                                                {isLocked && (
                                                    <ProBadge
                                                        label={config.label}
                                                    />
                                                )}
                                            </s-stack>
                                        </div>
                                    </s-clickable>
                                );
                            })}
                        </s-stack>
                    </div>
                </s-popover>
            </s-stack>

            {showDiscountValue && (
                <s-number-field
                    label={getDiscountValueLabel()}
                    value={discountValue?.toString() || ""}
                    step={discountType === "PERCENTAGE" ? 0.01 : 1}
                    min={0}
                    placeholder="0"
                    prefix={getPrefix()}
                    suffix={getSuffix()}
                    max={discountType === "PERCENTAGE" ? 99.99 : undefined}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        const raw = target.value;
                        const value =
                            discountType === "PERCENTAGE" && raw !== ""
                                ? String(Math.trunc(parseFloat(raw) * 100) / 100)
                                : raw;
                        handleDiscountValueChange(value);
                    }}
                    onBlur={(event: Event) => {
                        if (discountType === "PERCENTAGE") {
                            const target = event.target as HTMLInputElement;
                            const raw = target.value;
                            if (raw !== "") {
                                const truncated = String(Math.trunc(parseFloat(raw) * 100) / 100);
                                handleDiscountValueChange(truncated);
                            }
                        }
                        createBlurHandler("discountValue")();
                    }}
                    error={getFieldError("discountValue")}
                />
            )}

            <s-stack gap="base">
                <div className="flex-1">
                    <s-number-field
                        label={t("minOrderValue")}
                        value={minOrderValue?.toString() || ""}
                        step={1}
                        min={0}
                        placeholder="0.00"
                        prefix={getCurrency()}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleMinOrderValueChange(target.value);
                        }}
                        onBlur={createBlurHandler("minOrderValue")}
                        error={getFieldError("minOrderValue")}
                    />
                </div>

                {showMaxDiscountAmount && (
                    <div className="flex-1">
                        <s-number-field
                            label={t("maxDiscount")}
                            value={maxDiscountAmount?.toString() || ""}
                            step={1}
                            min={0}
                            placeholder={t("noLimit")}
                            prefix={getCurrency()}
                            onChange={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleMaxDiscountAmountChange(target.value);
                            }}
                            onBlur={createBlurHandler("maxDiscountAmount")}
                            error={getFieldError("maxDiscountAmount")}
                        />
                    </div>
                )}
            </s-stack>
        </s-stack>
    );
}
