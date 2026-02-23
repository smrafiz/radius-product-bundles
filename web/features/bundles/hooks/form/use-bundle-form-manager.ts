"use client";

import {
    getBundleProperty,
    useAutoGenerateName,
    UseBundleFormManagerOptions,
    useBundleFormMethods,
    useBundleStore,
} from "@/features/bundles";
import { useEffect, useMemo } from "react";
import { useAppNavigation } from "@/shared";
import { usePathname } from "next/navigation";

export function useBundleFormManager({
    bundleType,
    bundleName,
}: UseBundleFormManagerOptions) {
    const { bundleData, setBundleData } = useBundleStore();
    const { bundleData: navigationData } = useAppNavigation();
    const { setValue, watch } = useBundleFormMethods();

    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");
    const label = useMemo(
        () => getBundleProperty(bundleType, "label"),
        [bundleType],
    );

    const { generatedName, isGenerating } = useAutoGenerateName(
        bundleType,
        isEditMode,
    );

    const currentName = watch("name");

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType, { shouldDirty: false });
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

    useEffect(() => {
        if (!isEditMode && generatedName && !currentName) {
            setValue("name", generatedName, {
                shouldValidate: false,
                shouldDirty: false,
            });
        }
    }, [generatedName, isEditMode, currentName, setValue]);

    const pageProps = useMemo(() => {
        return {
            title: isEditMode
                ? `Edit ${bundleName || label}`
                : `Create ${label}`,
            badgeLabel: label,
            onBack: isEditMode ? navigationData?.list : navigationData?.create,
        };
    }, [isEditMode, bundleName, label, navigationData]);

    return {
        pageProps,
        isEditMode,
        bundleData,
        isGeneratingName: isGenerating,
    };
}
