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
    subtitle,
    cartButtonText,
    hideFooter,
    hideHeader,
    children,
}: BundleWidgetProps) {
    return (
        <>
            {!hideHeader && (
                <WidgetHeader
                    styles={styles}
                    displayOptions={displayOptions}
                    pricing={pricing}
                    title={title}
                    subtitle={subtitle}
                />
            )}
            {children}
            {!hideFooter && (
                <>
                    <WidgetPricingDisplay
                        styles={styles}
                        displayOptions={displayOptions}
                        pricing={pricing}
                    />
                    <WidgetAddToCart styles={styles} cartButtonText={cartButtonText} />
                </>
            )}
        </>
    );
}
