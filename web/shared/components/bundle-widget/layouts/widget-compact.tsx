"use client";

import { Fragment, useState } from "react";
import { getSpacing } from "@/features/settings";
import { WidgetLayoutProps, WidgetProductCard } from "@/shared";

export function WidgetCompact({
    products,
    styles,
    displayOptions,
    showEmptyState = true,
    initialVisibleCount = 4,
    labels,
}: WidgetLayoutProps) {
    const [showAll, setShowAll] = useState(false);
    const gap = getSpacing(styles.spacing);

    if (!products.length && showEmptyState) {
        return (
            <div className="flex flex-col items-center justify-around gap-3">
                <span
                    style={{
                        color: styles.textColor,
                        fontSize: styles.bodySize,
                    }}
                >
                    Please choose product to see the bundle preview
                </span>
            </div>
        );
    }

    const visibleItems = showAll
        ? products
        : products.slice(0, initialVisibleCount);

    return (
        <Fragment>
            <div
                className="compact-layout"
                style={{ display: "flex", flexDirection: "column", gap }}
            >
                {visibleItems.map((product) => (
                    <WidgetProductCard
                        key={product.id}
                        product={product}
                        styles={styles}
                        displayOptions={displayOptions}
                        labels={labels}
                        showCardStyle={false}
                    />
                ))}
            </div>

            {products.length > initialVisibleCount && (
                <button
                    className="mt-2 text-[12px] underline cursor-pointer"
                    onClick={() => setShowAll(!showAll)}
                    style={{
                        color: styles.textColor,
                    }}
                >
                    {showAll
                        ? "Show less"
                        : `+ ${products.length - initialVisibleCount} more products`}
                </button>
            )}
        </Fragment>
    );
}
