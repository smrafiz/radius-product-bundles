"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
    Box,
    Icon,
    InlineStack,
    Popover,
    ResourceItem,
    ResourceList,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import { BundleListItem } from "@/types";
import { groupProductsById } from "@/utils";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

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
    const groupedProducts = groupProductsById(bundle.products);
    const displayProducts = groupedProducts.slice(0, 3);
    const totalCount = groupedProducts.length;
    const remainingCount = Math.max(0, totalCount - 3);
    let arrowClass = '-left-12';

    if (totalCount === 1) {
        arrowClass = '-left-2';
    } else if (totalCount === 2) {
        arrowClass = '-left-7';
    }

    const activator = (
        <div
            className="cursor-pointer flex items-center gap-1"
            onClick={togglePopover}
        >
            <InlineStack gap="100" align="center">
                <InlineStack gap="100" align="center">
                    {displayProducts.map((product, index) => (
                        <Box key={`${product.id}-${index}`} position="relative">
                            <div
                                className={`relative w-10 h-10 rounded-full overflow-hidden border border-[var(--p-color-border)] ${
                                    index === 1
                                        ? "-left-5"
                                        : index === 2
                                          ? "-left-10"
                                          : ""
                                }`}
                            >
                                <Image
                                    src={product.featuredImage || ""}
                                    alt={product.title}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            {index === 2 && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-white/92 flex items-center justify-center text-[12px] font-bold rounded-full -left-10 right-10 border border-[var(--p-color-border)]">
                                    +{remainingCount}
                                </div>
                            )}
                        </Box>
                    ))}
                </InlineStack>
                <div
                    className={`w-10 h-10 relative ${arrowClass} flex items-center`}
                >
                    <Icon
                        source={popoverActive ? ChevronUpIcon : ChevronDownIcon}
                    />
                </div>
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
