"use client";

import { useDiscountSettings } from "@/features/bundles/hooks/ui/use-discount-settings";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore, usePlan } from "@/shared";
import { useState } from "react";

/**
 * Discount settings configuration component
 */
export function DiscountSettings() {
    const t = useTranslations("Bundles.Creation.Discount");
    const tdt = useTranslations("Bundles.DiscountTypes");
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
    const { canUse } = usePlan();
    const canAdvancedControls = canUse("advanced_discount_controls");
    const [isOpen, setIsOpen] = useState(false);
    const popoverId = "discount-type-popover";
    const selectedLabel =
        availableDiscountTypes.find((c) => c.id === discountType) != null
            ? tdt(discountType + ".label")
            : t("selectType");

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
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
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
                    <div className="p-2 w-100" role="listbox" aria-label={t("discountTypeLabel")}>
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
                                                openCrossSell(tdt(config.id + ".label"));
                                            } else {
                                                handleDiscountTypeChange(
                                                    config.id,
                                                );
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <div
                                            role="option"
                                            aria-selected={isSelected}
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
                                                        {tdt(config.id + ".label")}
                                                    </s-heading>
                                                    <s-paragraph color="subdued">
                                                        {tdt(config.id + ".description")}
                                                    </s-paragraph>
                                                </s-stack>
                                                {isLocked && (
                                                    <ProBadge
                                                        label={tdt(config.id + ".label")}
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
                <s-stack gap="small-200">
                    <s-number-field
                        label={getDiscountValueLabel()}
                        value={discountValue?.toString() || ""}
                        step={0.01}
                        min={0}
                        placeholder="0"
                        prefix={getPrefix()}
                        suffix={getSuffix()}
                        max={discountType === "PERCENTAGE" ? 99.99 : undefined}
                        onInput={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleDiscountValueChange(target.value);
                            createBlurHandler("discountValue")();
                        }}
                        error={getFieldError("discountValue")}
                    />
                    <s-text tone="neutral">{t("discountValueDesc")}</s-text>
                </s-stack>
            )}

            {canAdvancedControls ? (
                <s-stack gap="base">
                    <s-stack gap="small-200">
                        <s-number-field
                            label={t("minOrderValue")}
                            value={minOrderValue?.toString() || ""}
                            step={0.01}
                            min={0}
                            placeholder="0.00"
                            prefix={getCurrency()}
                            onInput={(event: Event) => {
                                const target =
                                    event.target as HTMLInputElement;
                                handleMinOrderValueChange(target.value);
                                createBlurHandler("minOrderValue")();
                            }}
                            error={getFieldError("minOrderValue")}
                        />
                        <s-text tone="neutral">
                            {t("minOrderValueDesc")}
                        </s-text>
                    </s-stack>

                    {showMaxDiscountAmount && (
                        <s-stack gap="small-200">
                            <s-number-field
                                label={t("maxDiscount")}
                                value={maxDiscountAmount?.toString() || ""}
                                step={0.01}
                                min={0}
                                placeholder={t("noLimit")}
                                prefix={getCurrency()}
                                onInput={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                    handleMaxDiscountAmountChange(target.value);
                                    createBlurHandler("maxDiscountAmount")();
                                }}
                                error={getFieldError("maxDiscountAmount")}
                            />
                            <s-text tone="neutral">
                                {t("maxDiscountDesc")}
                            </s-text>
                        </s-stack>
                    )}
                </s-stack>
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() =>
                        openCrossSell(t("minOrderValue"))
                    }
                >
                    <s-stack gap="base">
                        <div className="relative">
                            <div className="pointer-events-none">
                                <s-number-field
                                    label={t("minOrderValue")}
                                    value=""
                                    placeholder="0.00"
                                    prefix={getCurrency()}
                                    disabled
                                />
                            </div>
                            <span className="absolute top-0 right-0">
                                <ProBadge label={t("minOrderValue")} />
                            </span>
                            <span className="opacity-50">
                                <s-text tone="neutral">
                                    {t("minOrderValueDesc")}
                                </s-text>
                            </span>
                        </div>

                        {showMaxDiscountAmount && (
                            <div className="relative">
                                <div className="pointer-events-none">
                                    <s-number-field
                                        label={t("maxDiscount")}
                                        value=""
                                        placeholder={t("noLimit")}
                                        prefix={getCurrency()}
                                        disabled
                                    />
                                </div>
                                <span className="absolute top-0 right-0">
                                    <ProBadge label={t("maxDiscount")} />
                                </span>
                                <span className="opacity-50">
                                    <s-text tone="neutral">
                                        {t("maxDiscountDesc")}
                                    </s-text>
                                </span>
                            </div>
                        )}
                    </s-stack>
                </div>
            )}
        </s-stack>
    );
}
