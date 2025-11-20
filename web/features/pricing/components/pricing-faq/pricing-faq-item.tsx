"use client";
import { PricingFaqItemInfo } from "@/features/pricing";

interface PricingFaqItemProps extends PricingFaqItemInfo {
    expanded: boolean;
    onToggle: () => void;
}

export function PricingFaqItem({
    id,
    title,
    description,
    expanded,
    onToggle,
}: PricingFaqItemProps) {
    return (
        <s-box key={id} borderWidth="small" overflow="hidden">
            <s-clickable onClick={onToggle} aria-expanded={expanded}>
                <s-box padding="base" background="subdued">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>{title}</s-heading>
                        <s-icon
                            type={expanded ? "chevron-up" : "chevron-down"}
                        />
                    </s-stack>
                </s-box>
            </s-clickable>

            <div className={`grid transition-all duration-250 ease ${expanded ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"}`}>
                <div className="overflow-hidden">
                    <s-box padding="base">{description}</s-box>
                </div>
            </div>
        </s-box>
    );
}
