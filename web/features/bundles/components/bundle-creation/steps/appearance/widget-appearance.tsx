"use client";

import { useState } from "react";
import { RangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

/**
 * Widget Appearance Settings Component
 * Manages visual styling for buttons, products, and widget container
 */
export function WidgetAppearance() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const style = displaySettings.style || {};

    const [open, setOpen] = useState(true);

    /**
     * Updates a style property in the store
     */
    const updateStyle = (key: string, value: string | number | boolean) => {
        updateDisplaySettings("style", {
            ...style,
            [key]: value,
        });
    };

    return (
        <s-section>
            <s-stack>
                <div
                    className="cursor-pointer z-30"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="small"
                        aria-expanded={open}
                    >
                        <s-heading>Appearance</s-heading>
                        <s-icon type={open ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </div>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
                >
                    <s-stack gap="base" paddingBlockStart="base">
                        {/* Add to cart button styling */}
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                            background="subdued"
                            padding="small"
                            borderRadius="large"
                        >
                            <s-switch
                                id="cart-button-switch"
                                label="Styling of the Add to Cart button"
                                accessibilityLabel="Toggle add to cart"
                                checked={style.buttonStyleEnabled ?? true}
                                onInput={(event: Event) => {
                                    const target = event.target as HTMLInputElement;
                                    updateStyle("buttonStyleEnabled", target.checked);
                                }}
                            />
                        </s-stack>

                        {(style.buttonStyleEnabled ?? true) && (
                            <s-stack gap="base">
                                <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                                    <s-grid-item gridColumn="span 6" gridRow="span 2">
                                        <s-color-field
                                            label="Background"
                                            name="buttonBgColor"
                                            placeholder="Select a color"
                                            value={style.buttonBgColor || "#303030"}
                                            onInput={(event: Event) => {
                                                const target = event.target as HTMLInputElement;
                                                updateStyle("buttonBgColor", target.value);
                                            }}
                                        />
                                    </s-grid-item>
                                    <s-grid-item gridColumn="span 6" gridRow="span 2">
                                        <s-color-field
                                            label="Text"
                                            name="buttonTextColor"
                                            placeholder="Select a color"
                                            value={style.buttonTextColor || "#ffffff"}
                                            onInput={(event: Event) => {
                                                const target = event.target as HTMLInputElement;
                                                updateStyle("buttonTextColor", target.value);
                                            }}
                                        />
                                    </s-grid-item>
                                </s-grid>
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider
                                        values={style.buttonRadius ?? 6}
                                        action={(val) => updateStyle("buttonRadius", val)}
                                    />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        {/* Product styling */}
                        <s-stack gap="base">
                            <s-heading>Product</s-heading>
                            <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                                <s-grid-item gridColumn="span 4" gridRow="span 3">
                                    <s-color-field
                                        label="Background"
                                        name="productBgColor"
                                        placeholder="Select a color"
                                        value={style.productBgColor || "#f7f7f7"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("productBgColor", target.value);
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item gridColumn="span 4" gridRow="span 3">
                                    <s-color-field
                                        label="Text"
                                        name="productTextColor"
                                        placeholder="Select a color"
                                        value={style.productTextColor || "#303030"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("productTextColor", target.value);
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item gridColumn="span 4" gridRow="span 3">
                                    <s-color-field
                                        label="Review stars"
                                        name="productStarColor"
                                        placeholder="Select a color"
                                        value={style.productStarColor || "#ffce07"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("productStarColor", target.value);
                                        }}
                                    />
                                </s-grid-item>
                            </s-grid>
                        </s-stack>

                        <s-stack gap="base">
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <s-switch
                                    id="product-add-border"
                                    label="Add border"
                                    accessibilityLabel="Add border"
                                    checked={style.productBorderEnabled ?? true}
                                    onInput={(event: Event) => {
                                        const target = event.target as HTMLInputElement;
                                        updateStyle("productBorderEnabled", target.checked);
                                    }}
                                />
                            </s-stack>
                        </s-stack>

                        {(style.productBorderEnabled ?? true) && (
                            <s-stack gap="base">
                                <s-color-field
                                    label="Border color"
                                    name="productBorderColor"
                                    placeholder="Select a color"
                                    value={style.productBorderColor || "#e3e3e3"}
                                    onInput={(event: Event) => {
                                        const target = event.target as HTMLInputElement;
                                        updateStyle("productBorderColor", target.value);
                                    }}
                                />
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider
                                        values={style.productRadius ?? 12}
                                        action={(val) => updateStyle("productRadius", val)}
                                    />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        {/* Widget styling */}
                        <s-stack gap="base">
                            <s-heading>Widget</s-heading>
                            <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                                <s-grid-item gridColumn="span 6" gridRow="span 2">
                                    <s-color-field
                                        label="Background"
                                        name="widgetBgColor"
                                        placeholder="Select a color"
                                        value={style.widgetBgColor || "#ffffff"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("widgetBgColor", target.value);
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item gridColumn="span 6" gridRow="span 2">
                                    <s-color-field
                                        label="Text"
                                        name="widgetTextColor"
                                        placeholder="Select a color"
                                        value={style.widgetTextColor || "#303030"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("widgetTextColor", target.value);
                                        }}
                                    />
                                </s-grid-item>
                            </s-grid>

                            <s-stack gap="base">
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <s-switch
                                        id="widget-add-border"
                                        label="Add border"
                                        accessibilityLabel="Add border"
                                        checked={style.widgetBorderEnabled ?? true}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("widgetBorderEnabled", target.checked);
                                        }}
                                    />
                                </s-stack>
                            </s-stack>

                            {(style.widgetBorderEnabled ?? true) && (
                                <s-stack gap="base" paddingBlockEnd="base">
                                    <s-color-field
                                        label="Border color"
                                        name="widgetBorderColor"
                                        placeholder="Select a color"
                                        value={style.widgetBorderColor || "#e3e3e3"}
                                        onInput={(event: Event) => {
                                            const target = event.target as HTMLInputElement;
                                            updateStyle("widgetBorderColor", target.value);
                                        }}
                                    />
                                    <s-stack>
                                        <s-text>Corner radius</s-text>
                                        <RangeSlider
                                            values={style.widgetRadius ?? 12}
                                            action={(val) => updateStyle("widgetRadius", val)}
                                        />
                                    </s-stack>
                                </s-stack>
                            )}
                        </s-stack>
                    </s-stack>
                </div>
            </s-stack>
        </s-section>
    );
}