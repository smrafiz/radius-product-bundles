"use client";

import {
    BundleAsProduct,
    BundleBehavior,
    DiscountSettings,
} from "@/features/bundles";
import { usePathname } from "next/navigation";

export function DiscountStep() {
    const pathname = usePathname();
    const mode = pathname.includes("/edit") ? "edit" : "create";

    return (
        <s-stack gap="base">
            {/* Discount settings */}
            <s-section>
                <DiscountSettings />
            </s-section>

            {/* Bundle as a product */}
            <s-section>
                <BundleAsProduct mode={mode} />
            </s-section>

            {/* Bundle behavior */}
            <s-section>
                <BundleBehavior />
            </s-section>
        </s-stack>
    );
}
