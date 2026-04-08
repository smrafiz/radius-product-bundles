"use client";

import {
    BundleFormData,
    VOLUME_TIER_DEFAULT_TITLE,
    VolumeDiscountConfig,
    VolumeTier,
    volumeDiscountConfigSchema,
    useBundleStore,
} from "@/features/bundles";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { getCurrencySymbol, useShopSettings } from "@/shared";

const DEFAULT_CONFIG: VolumeDiscountConfig = {
    discountType: "PERCENTAGE",
    openEnded: true,
    tiers: [
        { id: "tier-0", minQuantity: 1, discount: 5, title: VOLUME_TIER_DEFAULT_TITLE },
        { id: "tier-1", minQuantity: 2, discount: 10, title: VOLUME_TIER_DEFAULT_TITLE, isDefault: true },
        { id: "tier-2", minQuantity: 3, discount: 15, title: VOLUME_TIER_DEFAULT_TITLE },
    ],
};

export function useVolumeDiscount() {
    const { bundleData, setBundleData } = useBundleStore();
    const { currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);
    const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
    const form = useFormContext<BundleFormData>();

    const config =
        (bundleData.volumeTiers as VolumeDiscountConfig | undefined) ??
        DEFAULT_CONFIG;

    // Seed volumeTiers into RHF on mount so canProceedToNextStep sees a defined value
    useEffect(() => {
        if (form) {
            form.setValue("volumeTiers", config, { shouldDirty: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derive inline tier errors synchronously from Zod
    const parseResult = volumeDiscountConfigSchema.safeParse(config);
    const tierFieldErrors = !parseResult.success
        ? parseResult.error.issues.reduce<
              Record<number, { minQuantity?: string; discount?: string; title?: string }>
          >((acc, issue) => {
              if (
                  issue.path[0] === "tiers" &&
                  typeof issue.path[1] === "number"
              ) {
                  const idx = issue.path[1];
                  const field = issue.path[2] as string;
                  if (!acc[idx]) acc[idx] = {};
                  if (field === "minQuantity")
                      acc[idx].minQuantity = issue.message;
                  if (field === "discount") acc[idx].discount = issue.message;
                  if (field === "title") acc[idx].title = issue.message;
              }
              return acc;
          }, {})
        : {};

    const updateConfig = (updates: Partial<VolumeDiscountConfig>) => {
        const next = { ...config, ...updates };
        setBundleData({ volumeTiers: next });
        if (form) {
            form.setValue("volumeTiers", next, { shouldDirty: true });
            void form.trigger("volumeTiers");
        }
    };

    const updateTier = (index: number, updates: Partial<VolumeTier>) => {
        const newTiers = config.tiers.map((t, i) => {
            if (i !== index) return t;
            return { ...t, ...updates };
        });

        if (updates.isDefault === true) {
            const radioTiers = newTiers.map((t, i) =>
                i === index ? t : { ...t, isDefault: false },
            );
            updateConfig({ tiers: radioTiers });
            return;
        }

        updateConfig({ tiers: newTiers });
    };

    const addTier = () => {
        if (config.tiers.length >= 10) return;
        const lastTier = config.tiers[config.tiers.length - 1];
        const newIndex = config.tiers.length;
        const newTier: VolumeTier = {
            id: `tier-${Date.now()}`,
            minQuantity: (isNaN(lastTier.minQuantity) ? 1 : lastTier.minQuantity) + 1,
            discount: (isNaN(lastTier.discount) ? 0 : lastTier.discount) + 5,
            title: VOLUME_TIER_DEFAULT_TITLE,
        };
        setLastAddedIndex(newIndex);
        updateConfig({ tiers: [...config.tiers, newTier] });
    };

    const removeTier = (index: number) => {
        if (config.tiers.length <= 1) return;
        const newTiers = config.tiers.filter((_, i) => i !== index);
        updateConfig({ tiers: newTiers });
    };

    return {
        config,
        currencySymbol,
        lastAddedIndex,
        tierFieldErrors,
        atLimit: config.tiers.length >= 10,
        updateConfig,
        updateTier,
        addTier,
        removeTier,
    };
}
