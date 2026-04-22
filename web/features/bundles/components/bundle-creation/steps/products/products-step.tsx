"use client";

import {
    BXGY_TYPES,
    BundleDetails,
    BundleType,
    ProductList,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { useCallback, useEffect, useRef } from "react";
import { useProductPicker } from "@/shared";
import { useFormContext } from "react-hook-form";
import { useSettingsStore } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";

export function ProductsStep({ bundleType }: { bundleType: BundleType }) {
    const t = useTranslations("Bundles.Creation.Products");
    const {
        selectedItems,
        setSelectedItems,
        validationAttempted,
        bundleData,
        setSameProductMode,
        setItemRole,
    } = useBundleStore(
        useShallow((s) => ({
            selectedItems: s.selectedItems,
            setSelectedItems: s.setSelectedItems,
            validationAttempted: s.validationAttempted,
            bundleData: s.bundleData,
            setSameProductMode: s.setSameProductMode,
            setItemRole: s.setItemRole,
        })),
    );
    const { getAllErrors } = useBundleValidation();
    const { openProductPicker, isLoading } = useProductPicker();
    const { clearErrors } = useFormContext();

    const settingsData = useSettingsStore(
        (state) => state.localData ?? state.serverData,
    );
    const isBxgy = (BXGY_TYPES as readonly BundleType[]).includes(bundleType);
    const isBogo = bundleType === "BOGO";
    const isVolume = bundleType === "VOLUME_DISCOUNT";
    const globalMax = (settingsData?.maxBundleProducts as number) ?? 10;
    const bogoMaxPicks = bundleData.sameProductMode ? 1 : 2;
    const maxProducts = isBogo ? bogoMaxPicks : globalMax;

    const actualPickCount =
        isBxgy && bundleData.sameProductMode
            ? selectedItems.filter((i) => i.role !== "REWARD").length
            : selectedItems.length;
    const isAtLimit = actualPickCount >= maxProducts;

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    useEffect(() => {
        const minRequired = isVolume ? 1 : 2;
        if (selectedItems.length >= minRequired) {
            clearErrors("products");
        }
    }, [selectedItems.length, clearErrors, isVolume]);

    // Auto-assign roles for BOGO and enforce product limits.
    // Runs whenever items change: trims excess, assigns TRIGGER/REWARD roles,
    // and mirrors reward in same-product mode.
    const prevLengthRef = useRef(selectedItems.length);
    useEffect(() => {
        if (!isBxgy) return;

        // Act when items were added, unassigned roles exist, or no TRIGGER is present
        const hasUnassigned = selectedItems.some(
            (i) => !i.role || i.role === "INCLUDED",
        );
        const hasTrigger = selectedItems.some((i) => i.role === "TRIGGER");
        if (selectedItems.length <= prevLengthRef.current && !hasUnassigned && hasTrigger) {
            prevLengthRef.current = selectedItems.length;
            return;
        }
        prevLengthRef.current = selectedItems.length;

        const sameMode = bundleData.sameProductMode;
        const limit = isBogo ? (sameMode ? 1 : 2) : globalMax;

        // Count actual picks (exclude auto-mirrored rewards in same-product mode)
        const picks = sameMode
            ? selectedItems.filter((i) => i.role !== "REWARD")
            : selectedItems;

        if (picks.length > limit) {
            const trimmed = picks.slice(0, limit);
            const withRoles = trimmed.map((item, i) => ({
                ...item,
                role: (i === 0 ? "TRIGGER" : "REWARD") as "TRIGGER" | "REWARD",
            }));

            if (sameMode) {
                const triggers = withRoles.filter((i) => i.role === "TRIGGER");
                const mirrored = triggers.map((t) => ({
                    ...t,
                    role: "REWARD" as const,
                    id: `reward-${t.id}`,
                }));
                const combined = [...withRoles, ...mirrored];
                prevLengthRef.current = combined.length;
                useBundleStore.getState().setSelectedItems(combined);
            } else {
                prevLengthRef.current = withRoles.length;
                useBundleStore.getState().setSelectedItems(withRoles);
            }
            return;
        }

        // Assign roles to any unassigned items
        const unassigned = selectedItems.filter(
            (i) => !i.role || i.role === "INCLUDED",
        );

        if (unassigned.length === 0) return;

        // In same-product mode, assign TRIGGER then mirror as REWARD in one batch
        if (sameMode && isBxgy) {
            const updated = selectedItems
                .filter((i) => i.role !== "REWARD")
                .map((item, i) => ({
                    ...item,
                    role: i === 0 ? ("TRIGGER" as const) : ("REWARD" as const),
                }));
            // Mirror each trigger as a reward
            const triggers = updated.filter((i) => i.role === "TRIGGER");
            const mirrored = triggers.map((t) => ({
                ...t,
                role: "REWARD" as const,
                id: `reward-${t.productId}`,
            }));
            const combined = [...updated, ...mirrored];
            prevLengthRef.current = combined.length;
            useBundleStore.getState().setSelectedItems(combined);
            return;
        }

        unassigned.forEach((item, index) => {
            if (!hasTrigger && index === 0) {
                setItemRole(item.id, "TRIGGER");
            } else {
                setItemRole(item.id, "REWARD");
            }
        });
    }, [
        isBxgy,
        isBogo,
        selectedItems,
        setItemRole,
        bundleData.sameProductMode,
        globalMax,
    ]);

    // Same-product toggle handler
    const handleSameProductToggle = useCallback(() => {
        const newValue = !bundleData.sameProductMode;
        setSameProductMode(newValue);

        if (newValue) {
            const triggerItems = selectedItems.filter(
                (item) => item.role === "TRIGGER",
            );
            const existingRewardIds = new Set(
                selectedItems
                    .filter((item) => item.role === "REWARD")
                    .map((item) => item.productId),
            );

            const currentNonReward = selectedItems.filter(
                (item) => item.role !== "REWARD",
            );
            const mirroredRewards = triggerItems
                .filter((item) => !existingRewardIds.has(item.productId))
                .map((item) => ({
                    ...item,
                    role: "REWARD" as const,
                    id: `reward-${item.id}`,
                }));

            const combined = [...currentNonReward, ...mirroredRewards];
            useBundleStore.getState().setSelectedItems(combined);
        } else {
            const withoutRewards = selectedItems.filter(
                (item) => item.role !== "REWARD",
            );
            useBundleStore.getState().setSelectedItems(withoutRewards);
        }
    }, [bundleData.sameProductMode, setSameProductMode, selectedItems]);

    // Get validation errors for this step
    const errors = getAllErrors();
    const hasProductError =
        validationAttempted &&
        errors.some(
            (error) => error.field === "products" || error.path === "products",
        );
    const productErrorMessage = errors.find(
        (error) => error.field === "products" || error.path === "products",
    )?.message;
    const showProductHint =
        !isBxgy && !isVolume && selectedItems.length === 1 && !hasProductError;

    return (
        <s-stack gap="base">
            {/* Bundle details */}
            <s-section>
                <BundleDetails bundleType={bundleType} />
            </s-section>

            {/* Bundle product list */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>{t("selectProducts")}</s-heading>
                        {selectedItems.length > 0 && (
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                                gap="small-300"
                            >
                                <s-button
                                    variant="primary"
                                    icon="plus"
                                    onClick={openProductPicker}
                                    loading={isLoading}
                                    disabled={isAtLimit}
                                    tone={
                                        hasProductError ? "critical" : undefined
                                    }
                                >
                                    {t("addProducts")}
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    tone="critical"
                                    icon="delete"
                                    onClick={handleClearAll}
                                >
                                    {t("clearAll")}
                                </s-button>
                            </s-stack>
                        )}
                    </s-stack>
                    {productErrorMessage && (
                        <div role="alert">
                            <s-banner tone="critical" data-fieldid="products">
                                {productErrorMessage}
                            </s-banner>
                        </div>
                    )}
                    {showProductHint && (
                        <s-banner tone="info">
                            {t("minProductHint")} ({selectedItems.length}/2)
                        </s-banner>
                    )}
                    {isVolume && selectedItems.length === 0 && (
                        <s-banner tone="info">
                            Select at least one product to apply volume discount tiers to.
                        </s-banner>
                    )}
                    {isVolume && selectedItems.length > 1 && (
                        <s-banner tone="info">
                            All selected products will share the same volume discount tiers. Customers buying any of these products will see the same volume discounts.
                        </s-banner>
                    )}
                    {isAtLimit && (
                        <s-banner tone="info">
                            {isBogo
                                ? bundleData.sameProductMode
                                    ? t("bogoSameProduct")
                                    : t("bogoTwoProducts")
                                : t("maxReached", {
                                      count: String(maxProducts),
                                  })}
                        </s-banner>
                    )}
                    <ProductList isBxgy={isBxgy} isBogo={isBogo} isVolume={isVolume} />
                    {isBxgy && (
                        <s-stack gap="small-200">
                            <s-switch
                                label={t("sameProductLabel")}
                                details={
                                    isBogo
                                        ? t("sameProductBogoDetails")
                                        : t("sameProductBxgyDetails")
                                }
                                checked={bundleData.sameProductMode || false}
                                onInput={(event: Event) => {
                                    const target = event.target as HTMLInputElement;
                                    if (
                                        target.checked !==
                                        bundleData.sameProductMode
                                    ) {
                                        handleSameProductToggle();
                                    }
                                }}
                            />
                            {!bundleData.sameProductMode && selectedItems.length > 0 && (
                                <s-banner tone="info">
                                    {t("sameProductHint")}
                                </s-banner>
                            )}
                        </s-stack>
                    )}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
