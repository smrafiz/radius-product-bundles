"use client";

import { BlockStack, Card, RadioButton, Text } from "@shopify/polaris";
import { useBundleStore } from "@/stores";

export default function BundleBehavior() {
    const { configuration, updateConfiguration } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Bundle Behavior
                </Text>

                <BlockStack gap="200">
                    <RadioButton
                        label="Apply discount to entire bundle"
                        checked={configuration.discountApplication === "bundle"}
                        id="bundle-discount"
                        name="discount-application"
                        onChange={() =>
                            updateConfiguration("discountApplication", "bundle")
                        }
                    />
                    <RadioButton
                        label="Apply discount to specific products only"
                        checked={
                            configuration.discountApplication === "products"
                        }
                        id="product-discount"
                        name="discount-application"
                        onChange={() =>
                            updateConfiguration(
                                "discountApplication",
                                "products",
                            )
                        }
                    />
                    <RadioButton
                        label="Free shipping on bundle"
                        checked={
                            configuration.discountApplication === "shipping"
                        }
                        id="free-shipping"
                        name="discount-application"
                        onChange={() =>
                            updateConfiguration(
                                "discountApplication",
                                "shipping",
                            )
                        }
                    />
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
