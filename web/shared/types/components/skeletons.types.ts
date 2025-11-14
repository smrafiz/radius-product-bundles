import { ReactNode } from "react";

/**
 * Props for SkeletonLine component
 */
export interface SkeletonLineProps {
    width?: number;
    duration?: number;
    height?: string;
    index?: number;
}

/**
 * Props for SkeletonLines component
 */
export interface SkeletonLinesProps {
    lines?: number;
    gap?: "small-300" | "small-400" | "base" | "large";
    startIndex?: number;
    height?: string;
    random?: boolean;
}

/**
 * Props for SkeletonSection component
 */
export interface SkeletonSectionProps {
    lines?: number;
    padding?: "none" | "small" | "base" | "large";
    gap?: "small-300" | "small-400" | "base" | "large";
    startIndex?: number;
    height?: string;
    random?: boolean;
}

/**
 * Props for SkeletonCard component
 */
export interface SkeletonCardProps {
    lines?: number;
    gridColumn?: `span ${number}` | "auto";
    gridRow?: `span ${number}` | "auto";
    height?: string;
    gap?: "small-300" | "small-400" | "base" | "large";
    random?: boolean;
}

/**
 * Props for the PageHeaderSkeleton component
 */
export interface PageHeaderSkeletonProps {
    showBackButton?: boolean;
    heading?: string;
    subtext?: string;
    skeletonText?: boolean;
}

/**
 * Props for PageSkeleton component
 */
export interface PageSkeletonProps {
    heading?: string;
    showPrimaryAction?: boolean;
    primaryActionText?: string;
    showSecondaryAction?: boolean;
    secondaryActionText?: string;
    children: ReactNode;
    withPadding?: boolean;
}

/**
 * Props for MetricCardSkeleton component
 */
export interface MetricCardSkeletonProps {
    title?: string;
    icon?: string;
}