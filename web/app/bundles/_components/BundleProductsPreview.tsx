"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
    Box,
    InlineStack,
    Popover,
    ResourceItem,
    ResourceList,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import { BundleListItem } from "@/types";
import { groupProductsById } from "@/utils";

interface Props {
    bundle: BundleListItem;
}

export default function BundleProductsPreview({ bundle }: Props) {
    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopover = useCallback(
        () => setPopoverActive((active) => !active),
        [],
    );

    // Use pre-fetched products from bundle data
    const displayProducts = bundle.products.slice(0, 3);
    const remainingCount = Math.max(0, bundle.products.length - 3);
    const groupedProducts = groupProductsById(bundle.products);

    const activator = (
        <div
            className="cursor-pointer flex items-center gap-1"
            onClick={togglePopover}
        >
            <InlineStack gap="100" align="center">
                {displayProducts.map((product, index) => (
                    <Box key={`${product.id}-${index}`} position="relative">
                        <div
                            className={`relative w-10 h-10 rounded-full overflow-hidden border border-[var(--p-color-border)] ${
                                index === 1
                                    ? "-left-4"
                                    : index === 2
                                      ? "-left-8"
                                      : ""
                            }`}
                        >
                            <Image
                                src={product.featuredImage || ""}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        </div>
                        {index === 2 && remainingCount > 0 && (
                            <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[12px] font-bold rounded-full -left-8 right-8 border border-[var(--p-color-border)]">
                                +{remainingCount}
                            </div>
                        )}
                    </Box>
                ))}
            </InlineStack>
        </div>
    );

    return (
        <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopover}
            preferredAlignment="left"
        >
            <Box padding="200" minWidth="280px">
                <ResourceList
                    resourceName={{ singular: "product", plural: "products" }}
                    items={groupedProducts}
                    renderItem={(product) => {
                        const media = (
                            <Thumbnail
                                source={product.featuredImage || ""}
                                alt={product.title}
                                size="small"
                            />
                        );

                        return (
                            <ResourceItem
                                id={product.id}
                                key={product.id}
                                media={media}
                                verticalAlignment="center"
                                onClick={() => {
                                    console.log(
                                        "Product clicked:",
                                        product.title,
                                    );
                                }}
                            >
                                <div className="flex items-center">
                                    <Text
                                        as="h4"
                                        variant="bodyMd"
                                        fontWeight="medium"
                                    >
                                        {product.title}
                                    </Text>
                                </div>
                            </ResourceItem>
                        );
                    }}
                />
            </Box>
        </Popover>
    );
}
