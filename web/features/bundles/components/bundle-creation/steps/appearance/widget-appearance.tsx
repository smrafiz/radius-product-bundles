"use client";
import { useState } from "react";

import { RangeSlider } from "@/shared/components/fields/range-slider";

export function WidgetAppearance() {
    const [show, setShow] = useState<boolean>(true);
    const [showBorder, setShowBorder] = useState<boolean>(true);
    const [activeAlign, setActiveAlign] = useState<"left" | "center" | "right">(
        "left",
    );

    const [open, setOpen] = useState(false);
    const handleToggle = () => setOpen((prev) => !prev);

    return (
        <s-section>
            <s-stack>
                {/* Header */}
                <div
                    onClick={handleToggle}
                    style={{ cursor: "pointer", zIndex: 30 }}
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
                {/* Collapsible Body */}
                <div
                    style={{
                        overflow: "hidden",
                        transition: "max-height 0.3s ease, opacity 0.3s ease",
                        maxHeight: open ? "1000px" : "0",
                        opacity: open ? 1 : 0,
                    }}
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
                                            placeholder="Select a color"
                                            value="#ffffff"
                                        />
                                    </s-grid-item>
                                </s-grid>
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        <s-stack gap="base">
                            <s-heading>Color</s-heading>
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
                                        placeholder="Select a color"
                                        value="#ffce07"
                                    />
                                </s-grid-item>
                            </s-grid>
                        </s-stack>

                        <s-stack gap="base">
                            <s-heading>Border</s-heading>
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
                                        setShowBorder(target.checked);
                                    }}
                                />
                            </s-stack>
                        </s-stack>
                        {showBorder && (
                            <s-stack gap="base">
                                <s-color-field
                                    label="Border color"
                                    placeholder="Select a color"
                                    value="#e3e3e3"
                                />
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RangeSlider />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        <s-stack gap="base">
                            <s-heading>Alignment</s-heading>
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
                    </s-stack>
                </div>
            </s-stack>
        </s-section>
    );
}
