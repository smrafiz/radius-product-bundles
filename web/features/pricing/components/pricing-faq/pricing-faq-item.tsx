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

            <div
                style={{
                    display: "grid",
                    gridTemplateRows: expanded ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    <s-box padding="base">{description}</s-box>
                </div>
            </div>
        </s-box>
    );
}
