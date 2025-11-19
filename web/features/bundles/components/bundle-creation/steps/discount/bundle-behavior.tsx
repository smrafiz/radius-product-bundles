"use client";

export function BundleBehavior() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>Bundle Behavior</s-heading>
                <s-stack gap="small-500">
                    <s-choice-list
                        name="bundleBehavior"
                    >
                        <s-choice
                            selected
                            value="bundle-discount"
                            id="bundle-discount"
                        >
                            Apply discount to entire bundle
                        </s-choice>
                        <s-choice
                            value="product-discount"
                            id="product-discount"
                        >
                            Apply discount to specific products only
                        </s-choice>
                        <s-choice value="free-shipping" id="free-shipping">
                            Free shipping on bundle
                        </s-choice>
                    </s-choice-list>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
