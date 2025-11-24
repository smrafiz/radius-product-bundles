"use client";
import { useState } from "react";

import { RangeSlider } from "@/shared/components/fields/range-slider";

export function WidgetAppearance() {
    const [show, setShow] = useState<boolean>(true);
    const [showBorder, setShowBorder] = useState<boolean>(true);
    const [showBorderWidget, setShowBorderWidget] = useState<boolean>(true);
    const [activeAlign, setActiveAlign] = useState<"left" | "center" | "right">(
        "left",
    );

    const [radius, setRadius] = useState(8);
    const [radiusProduct, setRadiusProduct] = useState(12);
    const [radiusWidget, setRadiusWidget] = useState(12);

    const [open, setOpen] = useState(false);
    const handleToggle = () => setOpen((prev) => !prev);

    return (
        <s-section>
            <s-stack>
                {/* Add to cart */}
                <div className="cursor-pointer z-30" onClick={handleToggle}>
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
                                checked={show}
                                onInput={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                        setShow(target.checked);
                                }}
                            />
                        </s-stack>

                        {show && (
                            <s-stack gap="base">
                                <s-grid
                                    gridTemplateColumns="repeat(12, 1fr)"
                                    gap="base"
                                >
                                    <s-grid-item
                                        gridColumn="span 6"
                                        gridRow="span 2"
                                    >
                                        <s-color-field
                                            label="Background"
                                            name="buttonBgColor"
                                            placeholder="Select a color"
                                            value="#303030"
                                        />
                                    </s-grid-item>
                                    <s-grid-item
                                        gridColumn="span 6"
                                        gridRow="span 2"
                                    >
                                        <s-color-field
                                            label="Text"
                                            name="buttonColor"
                                            placeholder="Select a color"
                                            value="#ffffff"
                                        />
                                    </s-grid-item>
                                </s-grid>
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider values={radius} onChange={(val) => setRadius(val)} />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        {/* Product */}

                        <s-stack gap="base">
                            <s-heading>Product</s-heading>
                            <s-grid
                                gridTemplateColumns="repeat(12, 1fr)"
                                gap="base"
                            >
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Background"
                                        name="productBgColor"
                                        placeholder="Select a color"
                                        value="#f7f7f7"
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Text"
                                        name="productColor"
                                        placeholder="Select a color"
                                        value="#303030"
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Review stars"
                                        name="productStarColor"
                                        placeholder="Select a color"
                                        value="#ffce07"
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
                                    checked={showBorder}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                            setShowBorder(target.checked);
                                    }}
                                />
                            </s-stack>
                        </s-stack>
                        {showBorder && (
                            <s-stack gap="base">
                                <s-color-field
                                    label="Border color"
                                    name="productBorderColor"
                                    placeholder="Select a color"
                                    value="#e3e3e3"
                                />
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider values={radiusProduct} onChange={(val) => setRadiusProduct(val)} />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-stack gap="base">
                            <s-text>Alignment</s-text>
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                background="subdued"
                                padding="small"
                                borderRadius="large"
                            >
                                <s-button
                                    variant={
                                        activeAlign === "left"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() => setActiveAlign("left")}
                                >
                                    Thumb Left
                                </s-button>

                                <s-button
                                    variant={
                                        activeAlign === "center"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() => setActiveAlign("center")}
                                >
                                    Thumb Center
                                </s-button>

                                <s-button
                                    variant={
                                        activeAlign === "right"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() => setActiveAlign("right")}
                                >
                                    Thumb Right
                                </s-button>
                            </s-stack>
                        </s-stack>

                        <s-divider />

                        {/* Widget */}

                        <s-stack gap="base">
                            <s-heading>Widget</s-heading>
                            <s-grid
                                gridTemplateColumns="repeat(12, 1fr)"
                                gap="base"
                            >
                                <s-grid-item
                                    gridColumn="span 6"
                                    gridRow="span 2"
                                >
                                    <s-color-field
                                        label="Background"
                                        name="widgetBgColor"
                                        placeholder="Select a color"
                                        value="#ffffff"
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 6"
                                    gridRow="span 2"
                                >
                                    <s-color-field
                                        label="Text"
                                        name="widgetColor"
                                        placeholder="Select a color"
                                        value="#303030"
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
                                        checked={showBorder}
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            setShowBorderWidget(target.checked);
                                        }}
                                    />
                                </s-stack>
                            </s-stack>
                            {showBorderWidget && (
                                <s-stack gap="base" paddingBlockEnd="base">
                                    <s-color-field
                                        label="Border color"
                                        name="widgetBorderColor"
                                        placeholder="Select a color"
                                        value="#e3e3e3"
                                    />
                                    <s-stack>
                                        <s-text>Corner radius</s-text>
                                        <RangeSlider values={radiusWidget} onChange={(val) => setRadiusWidget(val)} />
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
