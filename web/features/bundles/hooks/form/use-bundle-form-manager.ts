"use client";

import {
    getBundleProperty,
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
    const { setValue } = useBundleFormMethods();

    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");
    const label = useMemo(
        () => getBundleProperty(bundleType, "label"),
        [bundleType],
    );

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType);
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

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
    };
}
