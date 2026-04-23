"use client";

import { useMemo } from "react";
import {
    MetricCardSkeletonProps,
    PageHeaderSkeletonProps,
    PageSkeletonProps,
    SkeletonCardProps,
    SkeletonLineProps,
    SkeletonLinesProps,
    SkeletonSectionProps,
    useAppNavigation,
} from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Default fallback configs (used when not in random mode)
 */
const SKELETON_WIDTHS = [75, 90, 65, 85, 95, 70, 80, 88];
const SKELETON_DURATIONS = [1.5, 2.0, 1.8, 2.2, 1.7, 2.1, 1.9, 2.3];

/**
 * Single animated skeleton line
 */
export function SkeletonLine({
    width,
    duration,
    delay,
    height = "h-2",
    index = 0,
}: SkeletonLineProps & { delay?: string | number }) {
    const finalWidth = width ?? SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];
    const finalDuration =
        duration ?? SKELETON_DURATIONS[index % SKELETON_DURATIONS.length];

    return (
        <div
            className={`${height} bg-[#f3f3f3] rounded overflow-hidden relative`}
        >
            <div
                className="absolute inset-0 bg-linear-to-r from-bg-[#f3f3f3] via-[#f7f7f7] to-bg-[#f3f3f3] animate-shimmer"
                style={{
                    width: `${finalWidth}%`,
                    animationDuration: `${finalDuration}s`,
                    animationDelay: delay ? `${delay}s` : undefined,
                }}
            />
        </div>
    );
}

/**
 * Multiple skeleton lines with advanced random animation control
 */
export function SkeletonLines({
    lines = 8,
    gap = "base",
    startIndex = 0,
    height = "h-2",
    random = false,
}: SkeletonLinesProps) {
    const randomConfig = useMemo(() => {
        if (!random) return [];

        return Array.from({ length: lines }).map(() => ({
            width: Math.floor(Math.random() * 40) + 50, // 50% → 90%
            duration: (Math.random() * 1.2 + 0.8).toFixed(2), // 0.8s → 2s
            delay: (Math.random() * 1.6).toFixed(2), // 0s → 1.6s
        }));
    }, [lines, random]);

    return (
        <s-stack gap={gap}>
            {Array.from({ length: lines }).map((_, i) => {
                const lineIndex = startIndex + i;

                if (random) {
                    const config = randomConfig[i];

                    return (
                        <SkeletonLine
                            key={`random-${i}`}
                            width={config.width}
                            duration={Number(config.duration)}
                            delay={config.delay}
                            height={height}
                        />
                    );
                }

                return (
                    <SkeletonLine
                        key={`fixed-${i}`}
                        index={lineIndex}
                        height={height}
                    />
                );
            })}
        </s-stack>
    );
}

/**
 * Skeleton section with padding and multiple lines
 */
export function SkeletonSection({
    lines = 8,
    padding = "base",
    gap = "base",
    startIndex = 0,
    height = "h-2",
    random = false,
}: SkeletonSectionProps) {
    const sectionPadding = padding === "none" ? "none" : "base";

    return (
        <s-section padding={sectionPadding}>
            <div className="p-4">
                <SkeletonLines
                    lines={lines}
                    gap={gap}
                    startIndex={startIndex}
                    height={height}
                    random={random}
                />
            </div>
        </s-section>
    );
}

/**
 * Skeleton card for grid layouts
 */
export function SkeletonCard({
    lines = 14,
    gridColumn = "span 4",
    gridRow = "span 1",
    height = "h-2",
    gap = "base",
    random = false,
}: SkeletonCardProps) {
    return (
        <s-grid-item gridColumn={gridColumn} gridRow={gridRow}>
            <SkeletonSection
                lines={lines}
                gap={gap}
                height={height}
                random={random}
            />
        </s-grid-item>
    );
}

/**
 * Skeleton for page header with back button
 */
export function PageHeaderSkeleton({
    showBackButton = true,
    heading = "Loading...",
    subtext,
    skeletonText = false,
}: PageHeaderSkeletonProps) {
    const t = useTranslations("Common");
    const { goBack } = useAppNavigation();

    return (
        <s-stack direction="inline" gap="base">
            {showBackButton && (
                <s-stack paddingBlockStart="small-500">
                    <s-button
                        onClick={() => goBack("/dashboard")}
                        icon="arrow-left"
                        accessibilityLabel={t("back")}
                    ></s-button>
                </s-stack>
            )}
            <s-stack>
                <s-heading>
                    {skeletonText ? (
                        <div className="w-48">
                            <SkeletonLine height="h-6" width={75} />
                        </div>
                    ) : (
                        <div className="text-xl">{heading}</div>
                    )}
                </s-heading>
                {(subtext || skeletonText) && (
                    <s-text>
                        {skeletonText ? (
                            <div className="w-64">
                                <SkeletonLine height="h-4" width={85} />
                            </div>
                        ) : (
                            subtext
                        )}
                    </s-text>
                )}
            </s-stack>
        </s-stack>
    );
}

/**
 * Full page skeleton wrapper with optional header actions
 */
export function PageSkeleton({
    heading,
    showPrimaryAction = false,
    primaryActionText = "Action",
    showSecondaryAction = false,
    secondaryActionText = "Action",
    children,
    withPadding = true,
}: PageSkeletonProps) {
    const pageProps = heading ? { heading } : {};

    return (
        <s-page {...pageProps}>
            {showPrimaryAction && (
                <s-button
                    slot="primary-action"
                    variant="primary"
                    onClick={() => {}}
                >
                    {primaryActionText}
                </s-button>
            )}
            {showSecondaryAction && (
                <s-button
                    slot="secondary-actions"
                    variant="secondary"
                    onClick={() => {}}
                >
                    {secondaryActionText}
                </s-button>
            )}
            <s-stack
                gap="large"
                paddingBlockStart={withPadding ? "large-300" : "large"}
                paddingBlockEnd="large"
            >
                {children}
            </s-stack>
        </s-page>
    );
}

/**
 * Skeleton for metric/stats card
 */
export function MetricCardSkeleton({ title, icon }: MetricCardSkeletonProps) {
    const t = useTranslations("Common");
    return (
        <s-section>
            <s-stack>
                <s-stack direction="inline" gap="base" alignItems="center">
                    {icon && (
                        <div className="w-10">
                            <s-image
                                src={`/assets/${icon}.svg`}
                                alt={title || t("loading")}
                                aspectRatio="1/1"
                                inlineSize="auto"
                            />
                        </div>
                    )}
                    <s-stack gap="small-400">
                        {title ? (
                            <s-heading>{title}</s-heading>
                        ) : (
                            <div className="w-24">
                                <SkeletonLine height="h-5" width={80} />
                            </div>
                        )}
                        <div className="h-5 w-10">
                            <SkeletonLine height="h-5" width={90} />
                        </div>
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
