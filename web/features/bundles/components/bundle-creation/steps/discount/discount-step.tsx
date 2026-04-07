"use client";

import {
    BundleAsProduct,
    BundleBehavior,
    BundleType,
    BxgyDiscountSettings,
    DiscountSettings,
    VolumeDiscountSettings,
    useBundleStore,
} from "@/features/bundles";
import { usePathname } from "next/navigation";

const BXGY_TYPES: BundleType[] = ["BOGO", "BUY_X_GET_Y"];

export function DiscountStep() {
    const pathname = usePathname();
    const mode = pathname.includes("/edit") ? "edit" : "create";
    const bundleType = useBundleStore((s) => s.bundleData.type);
    const isBxgy = BXGY_TYPES.includes(bundleType as BundleType);
    const isVolume = bundleType === "VOLUME_DISCOUNT";

    if (isVolume) {
        return (
            <s-stack gap="base">
                <VolumeDiscountSettings />
            </s-stack>
        );
    }

    return (
        <s-stack gap="base">
            <s-section>
                {isBxgy ? <BxgyDiscountSettings /> : <DiscountSettings />}
            </s-section>

            <s-section>
                <BundleAsProduct mode={mode} />
            </s-section>

            {!isBxgy && (
                <s-section>
                    <BundleBehavior />
                </s-section>
            )}
        </s-stack>
    );
}
