"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";
import { CustomizerModal } from "@/features/settings";

export function SettingsCustomizer() {
    const [textValue, setTextValue] = useState<string>("");

    const handleChangeArea = (event: CallbackEvent<"s-text-area">) => {
        const { value } = event.target as HTMLTextAreaElement;
        setTextValue(value);
    };

    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div className="text-base">Customization</div>
                </s-heading>
                <s-divider />
                <s-paragraph>
                    Set colors, fonts, and other style settings.
                </s-paragraph>

                <s-stack direction="inline" alignItems="center" gap="small-400">
                    <s-badge tone="info">New</s-badge>
                    <s-paragraph>
                        Open the new design editor to update your design in real
                        time.
                    </s-paragraph>
                </s-stack>

                <CustomizerModal />

                <s-stack gap="small-400">
                    <s-text-area
                        label="Custom CSS"
                        value={textValue}
                        rows={6}
                        onChange={handleChangeArea}
                        details="Write custom CSS if you want to make unique visual
                        customizations, it will be applied to all pages that
                        bundle loads."
                    />
                </s-stack>
            </s-stack>
        </s-section>
    );
}
