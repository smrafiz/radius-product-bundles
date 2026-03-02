"use client";

import {
    BundleDetails,
    BundleType,
    ProductList,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useCallback, useEffect, useRef } from "react";
import { useProductPicker } from "@/shared";
import { useFormContext } from "react-hook-form";
import { useSettingsStore } from "@/features/settings";

const BXGY_TYPES: BundleType[] = ["BOGO", "BUY_X_GET_Y"];

export function ProductsStep({ bundleType }: { bundleType: BundleType }) {
    const {
        selectedItems,
        setSelectedItems,
        validationAttempted,
        bundleData,
        setSameProductMode,
        setItemRole,
    } = useBundleStore();
    const { getAllErrors } = useBundleValidation();
    const { openProductPicker, isLoading } = useProductPicker();
    const { clearErrors } = useFormContext();

    const settingsData = useSettingsStore(
        (state) => state.localData ?? state.serverData,
    );
    const isBxgy = BXGY_TYPES.includes(bundleType);
    const isBogo = bundleType === "BOGO";
    // BOGO: max 2 products (1 Buy + 1 Get). Same-product mode: 1 pick auto-mirrors.
    // BXGY: uses global maxProducts (future: variable quantities).
    const globalMax = (settingsData?.maxBundleProducts as number) ?? 10;
    const bogoMaxPicks = bundleData.sameProductMode ? 1 : 2;
    const maxProducts = isBogo ? bogoMaxPicks : globalMax;

    // For BOGO, count non-reward items (actual picks) vs total items
    const actualPickCount = isBogo
        ? selectedItems.filter((i) => i.role !== "REWARD" || !bundleData.sameProductMode).length
        : selectedItems.length;
    const isAtLimit = actualPickCount >= maxProducts;

    const handleClearAll = () => {
        setSelectedItems([]);
    };

    useEffect(() => {
        if (selectedItems.length >= 2) {
            clearErrors("products");
        }
    }, [selectedItems.length, clearErrors]);

    // Auto-assign roles for BOGO and enforce product limits.
    // Runs whenever items change: trims excess, assigns TRIGGER/REWARD roles,
    // and mirrors reward in same-product mode.
    const prevLengthRef = useRef(selectedItems.length);
    useEffect(() => {
        if (!isBxgy) return;

        // Only act when items were added (not removed or role-swapped)
        if (selectedItems.length <= prevLengthRef.current) {
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

        if (isBogo && picks.length > limit) {
            // Trim to limit, assign roles, and mirror if needed — all in one setState
            const trimmed = picks.slice(0, limit);
            const withRoles = trimmed.map((item, i) => ({
                ...item,
                role: (i === 0 ? "TRIGGER" : "REWARD") as "TRIGGER" | "REWARD",
            }));

            // Same-product mode: mirror the trigger as reward
            if (sameMode && withRoles.length === 1) {
                withRoles.push({
                    ...withRoles[0],
                    role: "REWARD",
                    id: `reward-${withRoles[0].productId}`,
                });
            }

            prevLengthRef.current = withRoles.length;
            useBundleStore.getState().setSelectedItems(withRoles);
            return;
        }

        // Assign roles to any unassigned items
        const hasTrigger = selectedItems.some((i) => i.role === "TRIGGER");
        const unassigned = selectedItems.filter(
            (i) => !i.role || i.role === "INCLUDED",
        );

        if (unassigned.length === 0) return;

        // In same-product mode, assign TRIGGER then mirror as REWARD in one batch
        if (sameMode && isBogo) {
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
    }, [isBxgy, isBogo, selectedItems, setItemRole, bundleData.sameProductMode, globalMax]);

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
                    id: `reward-${item.productId}`,
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
        !isBogo && selectedItems.length === 1 && !hasProductError;

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
                        <s-heading>Select products</s-heading>
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
                                    Add products
                                </s-button>
                                <s-button
                                    variant="secondary"
                                    tone="critical"
                                    icon="delete"
                                    onClick={handleClearAll}
                                >
                                    Clear all
                                </s-button>
                            </s-stack>
                        )}
                    </s-stack>
                    {productErrorMessage && (
                        <s-banner tone="critical" data-fieldid="products">
                            {productErrorMessage}
                        </s-banner>
                    )}
                    {showProductHint && (
                        <s-banner tone="info">
                            Add at least one more product to create a bundle. (
                            {selectedItems.length}/2 minimum)
                        </s-banner>
                    )}
                    {isAtLimit && (
                        <s-banner tone="info">
                            {isBogo
                                ? bundleData.sameProductMode
                                    ? "BOGO: 1 product selected. The same product will be used for both Buy and Get."
                                    : "BOGO: 2 products selected (1 Buy + 1 Get)."
                                : `Maximum ${maxProducts} products reached for this bundle.`}
                        </s-banner>
                    )}
                    <ProductList isBxgy={isBxgy} isBogo={isBogo} />
                    {isBogo && (
                        <s-switch
                            label="Same product for both"
                            details="Customer buys and gets the same product (e.g., Buy 1 Get 1 Free)"
                            checked={bundleData.sameProductMode || false}
                            onInput={(event: Event) => {
                                const target =
                                    event.target as HTMLInputElement;
                                if (
                                    target.checked !==
                                    bundleData.sameProductMode
                                ) {
                                    handleSameProductToggle();
                                }
                            }}
                        />
                    )}
                </s-stack>
            </s-section>
        </s-stack>
    );
}
