"use client";

import { MetricCardProps } from "@/shared";

export function MetricCard({
    title,
    value,
    svg_icon,
    icon,
    tone,
    loading = false,
}: MetricCardProps) {
    const isLoading = loading || value === undefined || value === null || value === "";


    {/*<Card>*/}
    {/*    <Box padding="400">*/}
    {/*        <BlockStack gap="200">*/}
    {/*            <Text as="h3" variant="headingMd" tone="subdued">*/}
    {/*                {title}*/}
    {/*            </Text>*/}

    {/*            /!* Metric Value *!/*/}
    {/*            {isLoading ? (*/}
    {/*                <div className="animate-pulse h-[40px]">*/}
    {/*                    <SkeletonDisplayText*/}
    {/*                        size="large"*/}
    {/*                        maxWidth="4ch"*/}
    {/*                    />*/}
    {/*                </div>*/}
    {/*            ) : (*/}
    {/*                <Text as="p" variant="heading2xl">*/}
    {/*                    {value}*/}
    {/*                </Text>*/}
    {/*            )}*/}

    {/*            /!* Growth Section *!/*/}
    {/*            {!isLoading && growth !== undefined && (*/}
    {/*                <InlineStack align="space-between">*/}
    {/*                    <InlineStack gap="100" align="center">*/}
    {/*                        <Icon*/}
    {/*                            source={getGrowthIcon(growth)}*/}
    {/*                            tone={getGrowthTone(growth)}*/}
    {/*                        />*/}
    {/*                        <Text*/}
    {/*                            as="span"*/}
    {/*                            variant="bodySm"*/}
    {/*                            tone={getGrowthTone(growth)}*/}
    {/*                        >*/}
    {/*                            {formatGrowth(growth)}*/}
    {/*                        </Text>*/}
    {/*                    </InlineStack>*/}
    {/*                    <Text as="span" variant="bodySm" tone="subdued">*/}
    {/*                        {comparisonLabel}*/}
    {/*                    </Text>*/}
    {/*                </InlineStack>*/}
    {/*            )}*/}

    {/*            /!* Optional Action *!/*/}
    {/*            {action && (*/}
    {/*                <Button*/}
    {/*                    variant="plain"*/}
    {/*                    size="slim"*/}
    {/*                    onClick={withLoader(() =>*/}
    {/*                        router.push(action.url),*/}
    {/*                    )}*/}
    {/*                >*/}
    {/*                    {action.label}*/}
    {/*                </Button>*/}
    {/*            )}*/}
    {/*        </BlockStack>*/}
    {/*    </Box>*/}
    {/*</Card>*/}

    return (
        <s-section>
            <s-stack>
                <s-stack direction="inline" gap="base" alignItems="center">
                    <div style={{ width: "var(--p-font-size-750)" }}>
                        <s-image
                            src={`/assets/${svg_icon}.svg`}
                            alt={title}
                            aspectRatio="1/1"
                            inlineSize="auto"
                        />
                    </div>
                    <s-stack gap="small-200">
                        <s-heading>{title}</s-heading>

                        {isLoading ? (
                            <s-section padding="base">
                                <s-stack gap="small-400">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-1 bg-[#f4f4f4] rounded overflow-hidden relative"
                                        >
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-[#f4f4f4] via-[#f8f8f8] to-[#f4f4f4] animate-shimmer"
                                                style={{
                                                    width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                                    animationDuration: `${1 + Math.random() * 1.5}s`,
                                                }}
                                            />
                                        </div>
                                    ))}
                                </s-stack>
                            </s-section>
                        ) : (
                            <s-stack direction="inline" gap="small-200">
                                <s-text>
                                    <div
                                        style={{
                                            fontSize: "var(--p-font-size-450)",
                                        }}
                                    >
                                        {value}
                                    </div>
                                </s-text>

                                {tone && icon && (
                                    <s-badge tone={tone} icon={icon}>
                                        12%
                                    </s-badge>
                                )}
                            </s-stack>
                        )}
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
