"use client";

import { ProductGroup } from "@/features/bundles";

interface BxgyProductItemProps {
    group: ProductGroup;
    roleBadge: "TRIGGER" | "REWARD";
    onRemove?: () => void;
    quantityLocked?: boolean;
}

export function BxgyProductItem({
    group,
    roleBadge,
    onRemove,
    quantityLocked,
}: BxgyProductItemProps) {
    const { product } = group;

    const badgeTone = roleBadge === "TRIGGER" ? "info" : "success";

    return (
        <s-box
            paddingBlock="small"
            paddingInlineStart="small-200"
            paddingInlineEnd="small-300"
            background="subdued"
            border="base"
            borderRadius="base"
        >
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
                gap="small"
            >
                <s-stack direction="inline" gap="small" alignItems="center">
                    {product.image ? (
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                            <s-image
                                src={product.image}
                                alt={product.title}
                                aspectRatio="40/40"
                                inlineSize="auto"
                                objectFit="cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                            <s-icon type="image" tone="neutral" />
                        </div>
                    )}

                    <s-stack>
                        <div className="w-[250px]">
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                            >
                                <s-heading>
                                    {product.title.replace(/ - .+$/, "")}
                                </s-heading>
                                <s-badge tone={badgeTone}>{roleBadge}</s-badge>
                            </s-stack>
                            {product.price && (
                                <s-text tone="neutral">${product.price}</s-text>
                            )}
                        </div>
                    </s-stack>
                </s-stack>

                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-text tone="neutral">Qty: 1</s-text>
                    {onRemove && (
                        <s-button
                            variant="tertiary"
                            icon="delete"
                            onClick={onRemove}
                            accessibilityLabel={`Remove ${product.title}`}
                        />
                    )}
                </s-stack>
            </s-stack>
        </s-box>
    );
}
