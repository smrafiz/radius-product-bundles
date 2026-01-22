"use client";

import {
    useSettingsForm,
    LabelsSettingsFormData,
    DEFAULT_LABELS,
} from "@/features/settings";

/**
 * Labels settings component
 *
 * Handles all customizable text labels for bundle widgets.
 * Labels are stored as a nested JSON object in the form.
 */
export function SettingsLabels() {
    const { watch, setValue, formState } = useSettingsForm();

    // Watch the entire labels object with default fallback
    const labels: LabelsSettingsFormData = watch("labels") ?? DEFAULT_LABELS;

    /**
     * Handles label field change
     */
    function handleLabelChange(
        field: keyof LabelsSettingsFormData,
        event: CustomEvent | React.ChangeEvent<HTMLInputElement>,
    ) {
        const target = event.target as HTMLInputElement;
        setValue("labels", {
            ...labels,
            [field]: target.value,
        });
    }

    /**
     * Gets error for a specific label field
     */
    function getLabelError(
        field: keyof LabelsSettingsFormData,
    ): string | undefined {
        const labelsErrors = formState.errors.labels as any;
        return labelsErrors?.[field]?.message;
    }

    return (
        <s-stack gap="large">
            {/* Widget Text Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Widget Text</s-heading>
                        <s-tooltip id="widget-text-tooltip">
                            <s-text>
                                Customize the main text displayed in bundle
                                widgets.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="widget-text-tooltip"
                        />
                    </s-stack>

                    <s-text-field
                        label="Bundle heading"
                        name="labels.headingLabel"
                        placeholder="Bundle & Save"
                        value={labels.headingLabel}
                        onChange={(e: any) =>
                            handleLabelChange("headingLabel", e)
                        }
                        details="Main heading displayed above the bundle widget."
                        error={getLabelError("headingLabel")}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-text-field
                            label="Add to cart button"
                            name="labels.addToCartText"
                            placeholder="Add Bundle to Cart"
                            value={labels.addToCartText}
                            onChange={(e: any) =>
                                handleLabelChange("addToCartText", e)
                            }
                            details="Text on the add to cart button."
                            error={getLabelError("addToCartText")}
                        />

                        <s-text-field
                            label="Quantity label"
                            name="labels.quantityLabel"
                            placeholder="Qty:"
                            value={labels.quantityLabel}
                            onChange={(e: any) =>
                                handleLabelChange("quantityLabel", e)
                            }
                            details="Label before quantity selector."
                            error={getLabelError("quantityLabel")}
                        />
                    </div>
                </s-stack>
            </s-section>

            {/* Button States Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Button States</s-heading>
                        <s-tooltip id="button-states-tooltip">
                            <s-text>
                                Text shown during different button states.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="button-states-tooltip"
                        />
                    </s-stack>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <s-text-field
                            label="Adding text"
                            name="labels.addingText"
                            placeholder="Adding..."
                            value={labels.addingText}
                            onChange={(e: any) =>
                                handleLabelChange("addingText", e)
                            }
                            details="Shown while adding to cart."
                            error={getLabelError("addingText")}
                        />

                        <s-text-field
                            label="Added text"
                            name="labels.addedText"
                            placeholder="Added!"
                            value={labels.addedText}
                            onChange={(e: any) =>
                                handleLabelChange("addedText", e)
                            }
                            details="Shown after successful add."
                            error={getLabelError("addedText")}
                        />

                        <s-text-field
                            label="Out of stock text"
                            name="labels.outOfStockText"
                            placeholder="Out of Stock"
                            value={labels.outOfStockText}
                            onChange={(e: any) =>
                                handleLabelChange("outOfStockText", e)
                            }
                            details="Shown when unavailable."
                            error={getLabelError("outOfStockText")}
                        />
                    </div>
                </s-stack>
            </s-section>

            {/* Price Labels Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Price Labels</s-heading>
                        <s-tooltip id="price-labels-tooltip">
                            <s-text>
                                Labels displayed next to prices in the bundle
                                widget.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="price-labels-tooltip"
                        />
                    </s-stack>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-text-field
                            label="Regular price label"
                            name="labels.regularPriceLabel"
                            placeholder="Regular Price:"
                            value={labels.regularPriceLabel}
                            onChange={(e: any) =>
                                handleLabelChange("regularPriceLabel", e)
                            }
                            details="Label for the original total price."
                            error={getLabelError("regularPriceLabel")}
                        />

                        <s-text-field
                            label="Bundle price label"
                            name="labels.bundlePriceLabel"
                            placeholder="Bundle Price:"
                            value={labels.bundlePriceLabel}
                            onChange={(e: any) =>
                                handleLabelChange("bundlePriceLabel", e)
                            }
                            details="Label for the discounted bundle price."
                            error={getLabelError("bundlePriceLabel")}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-text-field
                            label="Savings label"
                            name="labels.youSaveLabel"
                            placeholder="You Save:"
                            value={labels.youSaveLabel}
                            onChange={(e: any) =>
                                handleLabelChange("youSaveLabel", e)
                            }
                            details="Label for the savings amount."
                            error={getLabelError("youSaveLabel")}
                        />

                        <s-text-field
                            label="Savings badge text"
                            name="labels.savingsBadgeText"
                            placeholder="Save {percent}%"
                            value={labels.savingsBadgeText}
                            onChange={(e: any) =>
                                handleLabelChange("savingsBadgeText", e)
                            }
                            details="Text on savings badge. Use {percent} for dynamic value."
                            error={getLabelError("savingsBadgeText")}
                        />
                    </div>
                </s-stack>
            </s-section>

            {/* Shipping Labels Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Shipping Labels</s-heading>
                        <s-tooltip id="shipping-labels-tooltip">
                            <s-text>
                                Text related to shipping displayed in the
                                widget.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="shipping-labels-tooltip"
                        />
                    </s-stack>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-text-field
                            label="Free shipping label"
                            name="labels.freeShippingLabel"
                            placeholder="Free Shipping"
                            value={labels.freeShippingLabel}
                            onChange={(e: any) =>
                                handleLabelChange("freeShippingLabel", e)
                            }
                            details="Displayed when bundle includes free shipping."
                            error={getLabelError("freeShippingLabel")}
                        />

                        <s-text-field
                            label="Free shipping method title"
                            name="labels.freeShippingMethodTitle"
                            placeholder="Free Shipping"
                            value={labels.freeShippingMethodTitle}
                            onChange={(e: any) =>
                                handleLabelChange("freeShippingMethodTitle", e)
                            }
                            details="Shipping method name shown at checkout."
                            error={getLabelError("freeShippingMethodTitle")}
                        />
                    </div>
                </s-stack>
            </s-section>
        </s-stack>
    );
}
