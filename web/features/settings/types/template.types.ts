import type { BundleType } from "@/features/bundles";
import type { ComponentType, ReactNode } from "react";
import { CustomizerStyles, type WidgetLayout } from "@/features/settings";

/**
 * Extended template identifier — BundleType + UI-only templates.
 */
export type PreviewTemplateId = BundleType | "CART_BANNER";

/**
 * Props for per-bundle-type template components
 */
export interface BundleTemplateProps {
    activeLayout: WidgetLayout;
    activeDevice?: "desktop" | "tablet" | "mobile";
}

/**
 * Props for the layout tab sidebar.
 */
export interface LayoutSidebarProps {
    layouts: ReadonlyArray<{ label: string; value: string }>;
    activeLayout: WidgetLayout;
    onLayoutChange: (layout: WidgetLayout) => void;
    primaryColor: string;
    bundleType: PreviewTemplateId;
}

/**
 * Props for the responsive preview container.
 */
export interface PreviewContainerProps {
    activeDevice: "desktop" | "tablet" | "mobile";
    activeLayout?: string;
    styles: CustomizerStyles;
    isCartBanner?: boolean;
    children: ReactNode;
}

/**
 * Props for the unified PreviewShell wrapper.
 */
export interface PreviewShellProps {
    bundleType: PreviewTemplateId;
    scrollRef?: (node: HTMLDivElement | null) => void;
}

/**
 * Maps each template to its corresponding component.
 */
export type TemplateRegistry = Record<
    PreviewTemplateId,
    ComponentType<BundleTemplateProps>
>;

// ═══════════════════════════════════════════════════════════════════
// SHARED LAYOUT COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════

/**
 * Checkbox/radio SVG indicator.
 */
export interface CheckIndicatorProps {
    checked: boolean;
    color: string;
    borderColor: string;
    variant: "checkbox" | "radio";
}

/**
 * Uppercase section label.
 */
export interface SectionLabelProps {
    children: string;
    color: string;
    opacity?: number;
}

/**
 * Decorative divider line with optional center content.
 */
export interface SectionDividerProps {
    label?: string;
    color?: string;
    borderColor: string;
    opacity?: number;
}

/**
 * Product card with optional badge overlay.
 * Supports horizontal (default) and vertical orientations.
 */
export interface ProductCardProps {
    label: string;
    price: string;
    comparePrice?: string;
    badge?: { text: string; color: string };
    /** Card orientation: "horizontal" (image left) or "vertical" (image top). */
    variant?: "horizontal" | "vertical";
    /** Whether to render card background, border, and shadow. Default true. */
    showCardStyle?: boolean;
}

/**
 * Compact product card for BuyGet tier content.
 */
export interface MiniProductCardProps {
    isFree?: boolean;
    freeTagColor?: string;
}

/**
 * Product card with selection indicator for MixMatch.
 */
export interface SelectableProductCardProps {
    selected: boolean;
    selectionStyle: "checkbox" | "radio" | "highlight";
    accentColor: string;
}

/**
 * Vertical product card with checkbox for FBT.
 */
export interface FbtProductCardProps {
    name: string;
    price: string;
    checked: boolean;
    checkboxColor: string;
}

/**
 * "+" or line separator between FBT product cards.
 */
export interface FbtSeparatorProps {
    style: "plus" | "line" | "none";
    primaryColor: string;
    borderColor: string;
}

// ═══════════════════════════════════════════════════════════════════
// VOLUME DISCOUNT TYPES
// ═══════════════════════════════════════════════════════════════════

export interface VolumeTier {
    qty: number;
    discount: number;
    price: string;
}

/**
 * Volume tier table/cards display.
 */
export interface VolumeTiersProps {
    tiers: ReadonlyArray<VolumeTier>;
    highlightColor: string;
}

// ═══════════════════════════════════════════════════════════════════
// BUY X GET Y TYPES
// ═══════════════════════════════════════════════════════════════════

export interface BuyGetTier {
    buy: number;
    get: number;
    label: string;
}

/**
 * Tab navigation header for BuyGet tiers.
 */
export interface TierTabsProps {
    tiers: ReadonlyArray<BuyGetTier>;
    activeIndex: number;
}

/**
 * Bordered wrapper for a single BuyGet tier.
 */
export interface TierCardProps {
    label: string;
    variant: "cards" | "list";
    children: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════
// MIX & MATCH TYPES
// ═══════════════════════════════════════════════════════════════════

export interface MixMatchGroup {
    name: string;
    min: number;
    max: number;
    count: number;
}

/**
 * Group header with name and pick count indicator.
 */
export interface GroupHeaderProps {
    name: string;
    min: number;
    max: number;
    color: string;
}
