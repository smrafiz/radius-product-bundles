"use client";

import { Fragment, useState } from "react";
import {
    calculateDiscountedPrice,
    formatPrice,
    useBundleStore,
} from "@/features/bundles";
import {
    CustomizerStyles,
    getSpacing,
    useSettingsStore,
} from "@/features/settings";

/**
 * List layout for bundle product preview
 *
 * Displays products in a vertical list with dividers and proper discounted pricing.
 */
export function BundleLayoutList() {
    const { selectedItems, displaySettings, bundleData } = useBundleStore();
    const [showAll, setShowAll] = useState(false);
    const visibleItems = showAll ? selectedItems : selectedItems.slice(0, 4);

    const settings = useSettingsStore.getState().getEffectiveData();
    const styles = settings.globalStyles as CustomizerStyles;

    const gap = getSpacing(styles?.spacing);
    const showDivider = styles?.dividerStyle !== "none";

    if (!selectedItems.length) {
        return (
            <div className="min-h-96 flex flex-col items-center justify-around gap-3">
                <img
                    src="/assets/not-found.svg"
                    alt="No products selected"
                    className="w-1/2"
                />
                <span>Please choose product to see the bundle preview</span>
            </div>
        );
    }

    return (
        <Fragment>
            <div
                className="radius-bundle__products radius-bundle__products--list"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: `calc( ${gap} + 8px)`,
                }}
            >
                {visibleItems.map((item, index) => {
                    const originalPrice =
                        parseFloat(item.price) * item.quantity;
                    const discountedPrice = calculateDiscountedPrice(
                        originalPrice,
                        bundleData.discountType,
                        bundleData.discountValue,
                        bundleData.maxDiscountAmount,
                    );
                    const hasDiscount = discountedPrice < originalPrice;

                    return (
                        <Fragment key={item.id ?? index}>
                            <div className="radius-bundle__product radius-bundle__product--list">
                                {/* Image */}
                                {displaySettings.showImages &&
                                    item.image &&
                                    item.image.trim() !== "" && (
                                        <div className="radius-bundle__product-image">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                {/* Info */}
                                <div className="radius-bundle__product-info">
                                    <div className="radius-bundle__product-title">
                                        {displaySettings.enableHyperLink ? (
                                            <a
                                                href={item.url}
                                                className="hover:underline"
                                            >
                                                {item.title.length > 40
                                                    ? `${item.title.slice(0, 40)}...`
                                                    : item.title}
                                            </a>
                                        ) : (
                                            <span>
                                                {item.title.length > 40
                                                    ? `${item.title.slice(0, 40)}...`
                                                    : item.title}
                                            </span>
                                        )}
                                    </div>

                                    {displaySettings.showQuantity && (
                                        <div className="radius-bundle__product-quantity">
                                            Qty: {item.quantity}
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                {displaySettings.showPrices && (
                                    <div className="radius-bundle__product-price">
                                        <span className="radius-bundle__product-price-current">
                                            {formatPrice(discountedPrice)}
                                        </span>

                                        {displaySettings.showComparePrices &&
                                            hasDiscount && (
                                                <span className="radius-bundle__product-price-compare">
                                                    {formatPrice(originalPrice)}
                                                </span>
                                            )}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            {showDivider && index < visibleItems.length - 1 && (
                                <div className="radius-bundle__divider"
                                     style={{
                                         display: "flex",
                                         justifyContent: "center",
                                         alignItems: "center",
                                     }}
                                >
                                    {styles.dividerStyle === "plus" ? (
                                        <div className="flex justify-center"
                                             style={{
                                                 fontSize: "20px",
                                                 fontWeight: 600,
                                             }}
                                        >
                                            <div
                                                className="divider-position"
                                                style={{
                                                    backgroundColor: styles.primaryColor,
                                                    color: "#fff",
                                                    bottom: `calc(-1 * ${gap} / 2 - 8px)`,
                                                    marginBottom: `calc( ${gap} / 2 - 4px)`,
                                                }}
                                            >+</div>
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
                        </Fragment>
                    );
                })}
            </div>

            {selectedItems.length > 4 && (
                <button
                    className="text-[12px] underline cursor-pointer mt-2"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? "Show less"
                        : `+ ${selectedItems.length - 4} more products`}
                </button>
            )}
        </Fragment>
    );
}
