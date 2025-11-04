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
    const { goBack } = useAppNavigation();
    const { bundleData, setBundleData } = useBundleStore();
    const { bundleData: navigationData } = useAppNavigation();
    const { setValue } = useBundleFormMethods();

    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");

    useEffect(() => {
        if (!bundleData.type) {
            setBundleData({ ...bundleData, type: bundleType });
            setValue("type", bundleType);
        }
    }, [bundleType, bundleData, setBundleData, setValue]);

    const pageProps = useMemo(() => {
        if (isEditMode) {
            return {
                title: `Edit ${bundleName || getBundleProperty(bundleType, "label")}`,
                subtitle: "Update your bundle settings and preview changes",
                backAction: {
                    content: "Back to Bundles",
                    onAction: navigationData.create(),
                },
            };
        }

        return {
            title: `Create ${getBundleProperty(bundleType, "label")}`,
            subtitle:
                "Configure your bundle settings and preview the customer experience",
            backAction: {
                content: "Bundle Selection",
                onAction: navigationData.create(),
            },
        };
    }, [isEditMode, bundleType, bundleName, goBack]);

    return {
        pageProps,
        isEditMode,
        bundleData,
    };
}
