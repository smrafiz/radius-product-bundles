"use client";

import { Fragment, useState } from "react";
import { getSpacing } from "@/features/settings";
import { WidgetLayoutProps, WidgetProductCard } from "@/shared";

export function WidgetList({
    products,
    styles,
    displayOptions,
    showEmptyState = true,
    initialVisibleCount = 4,
}: WidgetLayoutProps) {
    const [showAll, setShowAll] = useState(false);
    const gap = getSpacing(styles.spacing);
    const showDivider = styles.dividerStyle !== "none";

    if (!products.length && showEmptyState) {
        return (
            <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                <img
                    src="/assets/not-found.svg"
                    alt="No products selected"
                    className="w-1/2"
                />
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
                className="list-layout"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: gap,
                }}
            >
                {visibleItems.map((product, index) => (
                    <div className="relative" key={product.id}>
                        <WidgetProductCard
                            product={product}
                            styles={styles}
                            displayOptions={displayOptions}
                            variant={
                                styles.imagePosition === "top"
                                    ? "vertical"
                                    : "horizontal"
                            }
                        />

                        {showDivider && index < visibleItems.length - 1 && (
                            <div
                                className="radius-bundle__divider"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingTop: gap,
                                }}
                            >
                                {styles.dividerStyle === "plus" ? (
                                    <div
                                        className="flex justify-center"
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        <div
                                            className="divider-position"
                                            style={{
                                                backgroundColor:
                                                    styles.primaryColor,
                                                color: "#fff",
                                                bottom: `calc(-1 * ${gap} / 2 - 8px)`,
                                                marginBottom: `calc(${gap} / 2 - 4px)`,
                                            }}
                                        >
                                            +
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "1px",
                                            backgroundColor: styles.borderColor,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
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
