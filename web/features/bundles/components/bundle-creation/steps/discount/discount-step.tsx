import { BundleBehavior, DiscountSettings } from "@/features/bundles";

export function DiscountStep() {
    return (
        <s-stack gap="base">
            <DiscountSettings />
            <BundleBehavior />
        </s-stack>
    );
}
