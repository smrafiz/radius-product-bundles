"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsLabel() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const style = displaySettings.style ?? {};
    const [open, setOpen] = useState(false);

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
        <s-stack>
            <div
                className={`cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${open ? "bg-[#f7f7f7]" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={open}
                >
                    <s-heading>Label</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    {/* Add to cart button styling */}
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-300"
                        >
                        </s-stack>
                        <s-text-field
                            label="Bundle heading text"
                            placeholder="Become heading text"
                            value={style.headingLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("headingLabel", target.value);
                            }}
                        />
                        <s-text-field
                            label="Quantity text"
                            placeholder="Become quantity text"
                            value={style.quantityLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("quantityLabel", target.value);
                            }}
                        />
                        <s-text-field
                            label="Regular price label"
                            placeholder="Become regular price"
                            value={style.regularPriceLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("regularPriceLabel", target.value);
                            }}
                        />
                        <s-text-field
                            label="Bundle price label"
                            placeholder="Become bundle price"
                            value={style.bundlePriceLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("bundlePriceLabel", target.value);
                            }}
                        />
                        <s-text-field
                            label="Savings label"
                            placeholder="Become you save"
                            value={style.youSaveLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("youSaveLabel", target.value);
                            }}
                        />
                        <s-text-field
                            label="Free shipping label"
                            placeholder="Become free shipping"
                            value={style.freeShippingLabel}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                updateStyle("freeShippingLabel", target.value);
                            }}
                        />
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
