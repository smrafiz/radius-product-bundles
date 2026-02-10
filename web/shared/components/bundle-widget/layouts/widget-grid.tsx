"use client";

import { Fragment, useState } from "react";
import { getSpacing } from "@/features/settings";
import { WidgetLayoutProps, WidgetProductCard } from "@/shared";

export function WidgetGrid({
    products,
    styles,
    displayOptions,
    showEmptyState = true,
    initialVisibleCount = 4,
}: WidgetLayoutProps) {
    const [showAll, setShowAll] = useState(false);
    const gap = getSpacing(styles.spacing);

    if (!products.length && showEmptyState) {
        return (
            <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                <img src="/assets/not-found.svg" alt="No products selected" className="w-1/2" />
                <span>Please choose product to see the bundle preview</span>
            </div>
        );
    }

    const visibleItems = showAll ? products : products.slice(0, initialVisibleCount);

    return (
        <Fragment>
            <div
                className="grid-layout"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${styles.gridColumns ?? 3}, minmax(0, 1fr))`,
                    gap,
                }}
            >
                {visibleItems.map((product) => (
                    <WidgetProductCard
                        key={product.id}
                        product={product}
                        styles={styles}
                        displayOptions={displayOptions}
                        variant="vertical"
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
                    {showAll ? "Show less" : `+ ${products.length - initialVisibleCount} more products`}
                </button>
            )}
        </Fragment>
    );
}
