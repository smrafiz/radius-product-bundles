import {
    AppSettingsFormData,
    ConditionContext,
    CustomizerFieldConfig,
    CustomizerPanelConfig,
    PreviewTemplateId,
} from "@/features/settings";
import { WidgetLayout } from "@/prisma/generated/enums";

/*
 * Settings form provider props
 */
export interface SettingsFormProviderProps {
    children: React.ReactNode;
    initialData?: Partial<AppSettingsFormData>;
    onDirtyChange?: (isDirty: boolean) => void;
}

/*
 * Dynamic customizer field props
 */
export interface DynamicCustomizerFieldProps {
    config: CustomizerFieldConfig;
    context: ConditionContext;
    onFieldChangeAction?: () => void;
    resetKey?: number;
}

/*
 * Responsive field indicator props
 */
export interface ResponsiveFieldIndicatorProps {
    activeDevice: "desktop" | "tablet" | "mobile";
    isInherited: boolean;
    onOverride: () => void;
    onClearOverride: () => void;
}

/*
 * Dynamic customizer panel props
 */
export interface DynamicCustomizerPanelProps {
    config: CustomizerPanelConfig;
    onFieldChangeAction?: () => void;
    onClearErrorsAction?: () => void;
    onAccordionChange?: (isOpen: boolean) => void;
    resetKey?: number;
    activeLayout?: WidgetLayout;
    activeBundleType?: PreviewTemplateId;
}

export interface ScrollBlurState {
    isScrolledTop: boolean;
    isScrolledBottom: boolean;
    scrollProgress: number;
}

export interface UseScrollBlurOptions {
    threshold?: number;
    onScrollChange?: (state: ScrollBlurState) => void;
}
