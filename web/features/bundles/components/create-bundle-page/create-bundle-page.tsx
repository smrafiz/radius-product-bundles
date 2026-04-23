"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    BundleCreationForm,
    BundleFormData,
    BundleFormProvider,
    BundleType,
    DiscountType,
    bundleTypeMap,
    useBundleStore,
    useBundleSubmit,
} from "@/features/bundles";
import { useShallow } from "zustand/react/shallow";
import { GlobalForm } from "@/shared";
import { BUNDLE_STEP_FIELD_MAP } from "@/features/bundles/constants/bundle-details.constants";
import { useTranslations } from "@/lib/i18n/provider";
import { useSettingsStore } from "@/features/settings";

const FIELD_LABEL_MAP: Record<string, string> = {
    name: "bundleName",
    products: "products",
    discountType: "discountType",
    discountValue: "discountValue",
    minOrderValue: "minOrderValue",
    maxDiscountAmount: "maxDiscount",
    discountApplication: "discountApplication",
    freeShipping: "freeShipping",
    createProduct: "createProduct",
    productTitle: "productTitle",
    productDescription: "productDescription",
    "settings.title": "offerTitle",
    "settings.cartButtonText": "cartButtonText",
    settings: "displaySettings",
    priority: "priority",
};

export function CreateBundlePage({
    params,
}: {
    params: { bundleType: BundleType };
}) {
    const { bundleType: bundleTypeParam } = params;
    const bundleType = bundleTypeMap[bundleTypeParam] as BundleType;
    const tf = useTranslations("Bundles.DetailsConstants.fieldLabels");

    const fieldLabels = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const [field, key] of Object.entries(FIELD_LABEL_MAP)) {
            labels[field] = tf(key);
        }
        return labels;
    }, [tf]);

    const { handleSubmit, resetDirty } = useBundleSubmit("create");
    const { setStep, setValidationAttempted, resetBundle, setBundleData } =
        useBundleStore(
            useShallow((s) => ({
                setStep: s.setStep,
                setValidationAttempted: s.setValidationAttempted,
                resetBundle: s.resetBundle,
                setBundleData: s.setBundleData,
            })),
        );

    const isFirstMount = useRef(true);

    // Returns discount defaults from app settings. VOLUME_DISCOUNT is excluded
    // because resetBundle() already sets QUANTITY_BREAKS for that type.
    const getDiscountDefaults = useCallback(() => {
        if (bundleType === "VOLUME_DISCOUNT") return {};
        const saved = useSettingsStore.getState().getEffectiveData();
        return {
            discountType: (saved?.defaultDiscountType as DiscountType) ?? "PERCENTAGE",
            discountValue: (saved?.defaultDiscountValue as number) ?? 0,
        };
    }, [bundleType]);

    // Reset store when bundleType changes (same-page param change)
    // and on unmount (navigating away). Belt-and-suspenders: handles both
    // Next.js route-pattern reuse (no unmount between /new/bogo → /new/fixed)
    // and full component unmount.
    // NOTE: Skip reset on initial mount — BundleFormProvider already initializes
    // the store with discount defaults. Running resetBundle here after the child
    // effect would wipe those values (parent effects run after child effects).
    useEffect(() => {
        if (!isFirstMount.current) {
            resetBundle(bundleType);
            setBundleData({ type: bundleType, ...getDiscountDefaults() });
            setStep(1);
        }
        isFirstMount.current = false;
        return () => {
            resetBundle();
        };
    }, [bundleType, resetBundle, setBundleData, setStep, getDiscountDefaults]);

    const handleDiscard = useCallback(() => {
        resetBundle(bundleType);
        setBundleData({ type: bundleType, ...getDiscountDefaults() });
        setStep(1);
    }, [resetBundle, setBundleData, setStep, bundleType, getDiscountDefaults]);

    /**
     * Handles validation errors by navigating to the step with the error.
     */
    const handleValidationError = ({ step }: { step?: number }) => {
        if (step) {
            setStep(step);
            setValidationAttempted(true);
        }
    };

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm<BundleFormData>
                formId="bundle"
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                onDiscard={handleDiscard}
                stepFieldMap={BUNDLE_STEP_FIELD_MAP}
                fieldLabels={fieldLabels}
                onValidationError={handleValidationError}
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}
