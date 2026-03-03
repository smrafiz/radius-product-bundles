import type { ReactNode } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import type { CustomizerStyles } from "@/features/settings";
import type { AppSettingsLabels } from "@/features/settings/types/app-settings.types";

export interface CalloutButtonProps {
    content: string;
    props?: {
        url?: string;
        external?: boolean;
    };
    tone?:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
}

export interface CalloutCardProps {
    title: string;
    icon: string;
    description: string;
    primaryButton?: CalloutButtonProps | null;
}

/*
 * GlobalForm Props
 */
export interface GlobalFormProps<T extends FieldValues> {
    children: React.ReactNode;
    onSubmit: (data: T) => Promise<void>;
    resetDirty?: () => void;
    onDiscard?: () => void;
    /** Unique form identifier for multiple forms */
    formId?: string;
    /** Maps field names to step numbers (for multi-step forms) */
    stepFieldMap?: Record<string, number>;
    /** Maps field names to human-readable labels for error banners */
    fieldLabels?: Record<string, string>;
    /** Custom validation error handler */
    onValidationError?: (error: {
        step?: number;
        field: string;
        errors: FieldErrors<T>;
        message: string;
    }) => void;
}

/**
 * Table Pagination Props
 */
export interface TablePaginationProps {
    hasPrevious: boolean;
    hasNext: boolean;
    label: string;
    onPrevious: () => void;
    onNext: () => void;
    loading?: boolean;
}

export interface PreviewProduct {
    id: string;
    title: string;
    image?: string;
    price: string;
    compareAtPrice?: string;
    quantity: number;
    url?: string;
    badge?: { text: string; color: string };
    role?: "TRIGGER" | "REWARD" | "INCLUDED" | "OPTIONAL" | "GROUP_OPTION";
}

export interface WidgetDisplayOptions {
    showImages: boolean;
    showPrices: boolean;
    showComparePrices: boolean;
    showQuantity: boolean;
    showSavingsBadge: boolean;
    showSavings: boolean;
    showFreeShipping: boolean;
    enableHyperLink: boolean;
}

export interface WidgetPricing {
    originalPrice: string;
    finalPrice: string;
    savingsAmount: string;
    savingsPercentage: number;
    hasDiscount: boolean;
}

export interface BundleWidgetProps {
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    pricing: WidgetPricing;
    title?: string;
    subtitle?: string;
    cartButtonText?: string;
    hideFooter?: boolean;
    hideHeader?: boolean;
    children: ReactNode;
}

export interface WidgetLabels extends Partial<AppSettingsLabels> {}

export interface WidgetLayoutProps {
    products: PreviewProduct[];
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    showEmptyState?: boolean;
    initialVisibleCount?: number;
    pricing?: WidgetPricing;
    cartButtonText?: string;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    labels?: WidgetLabels;
}

export interface WidgetHeaderProps {
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    pricing: WidgetPricing;
    title?: string;
    subtitle?: string;
}

export interface WidgetPricingProps {
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    pricing: WidgetPricing;
}

export interface WidgetProductCardProps {
    product: PreviewProduct;
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    variant?: "horizontal" | "vertical";
    showCardStyle?: boolean;
}

export interface MediaCardProps {
    title: string;
    description: string;
    buttonLabel?: string;
    buttonHref?: string;
    onButtonClick?: () => void;
    icon?: ReactNode;
}
