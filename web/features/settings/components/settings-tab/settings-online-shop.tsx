"use client";
import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsOnlineShop() {
    const [title, setTitle] = useState<string>("");

    const handleChange = (event: CallbackEvent<"s-text-area">) => {
        const { name, value } = event.target as HTMLInputElement;
        if (name === "title") {
            const newValue = value.slice(0, 999);
            setTitle(newValue);
        }
    };

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div className="text-base">Enable in online shop</div>
                </s-heading>

                <s-divider />

                <s-stack gap="small-400">
                    <s-text-area
                        label="Disable automatic injection of widgets on specific urls"
                        value={title}
                        rows={2}
                        onChange={handleChange}
                        maxLength={999}
                        details="Enter specific urls or parts of urls where you want to
                        prevent the app from injecting the widgets
                        automatically. The widgets will remain hidden on all
                        URLs that contain the parts of URLs you specify here.
                        Separate urls with commas or new lines."
                    />
                </s-stack>

                <s-choice-list
                    labelAccessibilityVisibility="exclusive"
                    label="Automatically"
                    name="automatically"
                    multiple
                >
                    <s-choice value="automatically-inject">
                        Automatically inject widgets into HTML
                        <s-text slot="details">
                            Uncheck to stop showing bundle widgets on places
                            where you didn't manually put in the bundler target
                            elements.
                        </s-text>
                    </s-choice>
                    <s-choice value="enable-online-shop">
                        Enable in online shop
                        <s-text slot="details">
                            Uncheck to stop showing bundle widgets, savings
                            popups and stop applying discounts in online shop.
                            Bundler can still be used in Shopify POS.
                        </s-text>
                    </s-choice>
                </s-choice-list>
            </s-stack>
        </s-section>
    );
}
