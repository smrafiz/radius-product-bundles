"use client";

import {
    BundleWidgetProps,
    WidgetAddToCart,
    WidgetHeader,
    WidgetPricingDisplay,
} from "@/shared";

export function BundleWidget({
    styles,
    displayOptions,
    pricing,
    title,
    cartButtonText,
    children,
}: BundleWidgetProps) {
    return (
        <>
            <WidgetHeader
                styles={styles}
                displayOptions={displayOptions}
                pricing={pricing}
                title={title}
            />
            {children}
            <WidgetPricingDisplay
                styles={styles}
                displayOptions={displayOptions}
                pricing={pricing}
            />
            <WidgetAddToCart styles={styles} cartButtonText={cartButtonText} />
        </>
    );
}
