import type { BundleType } from "@/features/bundles";
import type { ComponentType, ReactNode } from "react";
import { CustomizerStyles } from "@/features/settings";
import type { WidgetLayout } from "@/prisma/generated/enums";

/**
 * Props for per-bundle-type template components
 */
export interface BundleTemplateProps {
    activeLayout: WidgetLayout;
}

/**
 * Props for the layout tab sidebar.
 */
export interface LayoutSidebarProps {
    layouts: ReadonlyArray<{ label: string; value: string }>;
    activeLayout: WidgetLayout;
    onLayoutChange: (layout: WidgetLayout) => void;
    primaryColor: string;
    bundleType: BundleType;
}

/**
 * Props for the responsive preview container.
 */
export interface PreviewContainerProps {
    activeDevice: "desktop" | "tablet" | "mobile";
    styles: CustomizerStyles;
    children: ReactNode;
}

/**
 * Props for the unified PreviewShell wrapper.
 */
export interface PreviewShellProps {
    bundleType: BundleType;
}

/**
 * Maps each BundleType to its corresponding template component.
 */
export type TemplateRegistry = Record<
    BundleType,
    ComponentType<BundleTemplateProps>
>;
