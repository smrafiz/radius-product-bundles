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
    labels,
    hideFooter,
    hideHeader,
    hidePricing,
    hideOriginalPrice,
    children,
}: BundleWidgetProps) {
    return (
        <>
            {!hideHeader && (
                <WidgetHeader
                    styles={styles}
                    displayOptions={displayOptions}
                    pricing={pricing}
                    title={title || labels?.headingLabel}
                    subtitle={subtitle}
                    labels={labels}
                />
            )}
            {children}
            {!hideFooter && (
                <>
                    {!hidePricing && (
                        <WidgetPricingDisplay
                            styles={styles}
                            displayOptions={displayOptions}
                            pricing={pricing}
                            hideOriginalPrice={hideOriginalPrice}
                            labels={labels}
                        />
                    )}
                    <WidgetAddToCart
                        styles={styles}
                        cartButtonText={cartButtonText || labels?.addToCartText}
                    />
                </>
            )}
        </>
    );
}
