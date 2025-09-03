export interface ToastState {
    active: boolean;
    message: string;
    error?: boolean;
}

export interface LoadingState {
    isLoading: boolean;
    loadingText?: string;
}

export interface ErrorState {
    hasError: boolean;
    message: string;
    code?: string;
}

export type GrowthTone =
    | "base"
    | "success"
    | "critical"
    | "caution"
    | "subdued";

export interface MetricCardProps {
    title: string;
    value: string | number;
    growth?: number;
    subtitle?: string;
    action?: {
        text: string;
        url: string;
    };
}

export interface QuickAction {
    label: string;
    icon: React.ComponentType;
    url: string;
    variant?: "primary" | "secondary";
}

export interface NavigationItem {
    label: string;
    url: string;
    icon?: React.ComponentType;
    badge?: string | number;
    isActive?: boolean;
}
