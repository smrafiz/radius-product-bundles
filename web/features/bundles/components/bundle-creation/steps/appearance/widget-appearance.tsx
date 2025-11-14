"use client";
import { useState } from "react";
export function WidgetAppearance() {

    const [show, setShow] = useState<boolean>(false);


    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Appearance</s-heading>

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
                            const target = event.target as HTMLInputElement;
                            setShow(target.checked);
                        }}
                    />
                </s-stack>

                {show && (
                    <s-stack gap="base">
                        <s-grid gridTemplateColumns="repeat(12, 1fr)" gap="base">
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field label="Background" placeholder="Select a color" value="#FF0000" />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field label="Text" placeholder="Select a color" value="#FF0000" />
                            </s-grid-item>
                        </s-grid>
                    </s-stack>
                )}



            </s-stack>
        </s-section>
    );
}
