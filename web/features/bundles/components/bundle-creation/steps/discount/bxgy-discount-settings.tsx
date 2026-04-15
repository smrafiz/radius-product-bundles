"use client";

import { useDiscountSettings, useBundleStore } from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore, usePlan, triggerSaveBar } from "@/shared";
import { useState } from "react";

export function BxgyDiscountSettings() {
    const t = useTranslations("Bundles.Creation.Discount");
    const tdt = useTranslations("Bundles.DiscountTypes");
    const {
        discountType,
        discountValue,
        availableDiscountTypes,
        isDiscountTypeLocked,
        handleDiscountTypeChange,
        handleDiscountValueChange,
        createBlurHandler,
        getDiscountValueLabel,
        getSuffix,
        getPrefix,
        getFieldError,
        showDiscountValue,
    } = useDiscountSettings();
    const { open: openCrossSell } = useCrossSellStore();
    const { canUse } = usePlan();
    const { bundleData, setBundleData, markDirty } = useBundleStore(
        useShallow((s) => ({
            bundleData: s.bundleData,
            setBundleData: s.setBundleData,
            markDirty: s.markDirty,
        })),
    );
    const canFreeShipping = canUse("bundle_behavior");
    const [isOpen, setIsOpen] = useState(false);
    const popoverId = "bxgy-discount-type-popover";

    const getLabel = (config: { id: string }) =>
        config.id === "CUSTOM_PRICE" ? t("rewardPrice") : tdt(config.id + ".label");

    const selectedLabel =
        availableDiscountTypes.find((c) => c.id === discountType)
            ? getLabel(availableDiscountTypes.find((c) => c.id === discountType)!)
            : t("selectType");

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>{t("rewardHeading")}</s-heading>
                <s-tooltip id="bxgy-discount-tooltip">
                    <s-text>{t("rewardTooltip")}</s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bxgy-discount-tooltip"
                />
            </s-stack>

            <s-banner tone="info">{t("rewardOnly")}</s-banner>

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
                    <div className="p-2">
                        <s-stack gap="small-400">
                            {availableDiscountTypes.map((config) => {
                                const isSelected = config.id === discountType;
                                const isLocked = isDiscountTypeLocked(
                                    config.id,
                                );
                                const label = getLabel(config);

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
                                                openCrossSell(label);
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
                                                        {label}
                                                    </s-heading>
                                                    <s-paragraph color="subdued">
                                                        {tdt(config.id + ".description")}
                                                    </s-paragraph>
                                                </s-stack>
                                                {isLocked && (
                                                    <ProBadge label={label} />
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

            {discountType === "PERCENTAGE" && (
                <s-banner tone="info">{t("bogoFreeHint")}</s-banner>
            )}

            {showDiscountValue && (
                <s-number-field
                    label={
                        discountType === "CUSTOM_PRICE"
                            ? t("rewardProductPrice")
                            : getDiscountValueLabel()
                    }
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
            )}

            <s-divider />

            {canFreeShipping ? (
                <s-switch
                    name="freeShipping"
                    label={t("freeShipping")}
                    details={t("freeShippingDetails")}
                    checked={bundleData.freeShipping}
                    onInput={(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        setBundleData({
                            ...bundleData,
                            freeShipping: target.checked,
                        });
                        markDirty();
                        triggerSaveBar();
                    }}
                />
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() => openCrossSell(t("freeShipping"))}
                >
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <div className="pointer-events-none">
                            <s-switch
                                name="freeShipping-locked"
                                label={t("freeShipping")}
                                details={t("freeShippingDetails")}
                                disabled
                            />
                        </div>
                        <ProBadge label={t("freeShipping")} />
                    </s-stack>
                </div>
            )}
        </s-stack>
    );
}
