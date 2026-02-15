import { z } from "zod";
import { BundleType } from "@/features/bundles";
import { WidgetLayout } from "@/prisma/generated/enums";
import { appSettingsSchema, PreviewTemplateId } from "@/features/settings";

/**
 * Validation configuration
 */
export interface FieldValidation {
    required?: string;
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
}

/**
 * Base field configuration
 */
interface BaseFieldConfig {
    name: string;
    label: string;
    details?: string;
    placeholder?: string;
    validation?: FieldValidation;
    fullWidth?: boolean;
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
    type: "text";
    defaultValue?: string;
}

/**
 * Textarea field configuration
 */
export interface TextAreaFieldConfig extends BaseFieldConfig {
    type: "textarea";
    rows?: number;
    defaultValue?: string;
}

/**
 * Number field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    readOnly?: boolean;
    defaultValue?: number;
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
    type: "select";
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
}

/**
 * Switch field configuration
 */
export interface SwitchFieldConfig extends BaseFieldConfig {
    type: "switch";
    defaultValue?: boolean;
}

/**
 * Custom component field
 */
export interface CustomFieldConfig extends BaseFieldConfig {
    type: "custom";
    component: string;
    defaultValue?: any;
}

/**
 * Union type for all field configurations
 */
export type FieldConfig =
    | TextFieldConfig
    | TextAreaFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | SwitchFieldConfig
    | CustomFieldConfig;

/**
 * Section configuration
 */
export interface SectionConfig {
    id: string;
    title: string;
    description?: string;
    tooltip?: string;
    fields: FieldConfig[];
    columns?: 1 | 2 | 3;
}

/**
 * Tab configuration
 */
export interface SettingsTabConfig {
    id: string;
    title: string;
    icon:
        | "settings"
        | "store-online"
        | "paint-brush-round"
        | "text-block"
        | "refresh"
        | "button"
        | "variant"
        | "apps"
        | "inventory"
        | "adjust"
        | "notification"
        | "dns-settings"
        | "wrench";
    sections?: SectionConfig[];
    parentPath?: string;
    labelSections?: SectionConfig[];
}

/**
 * Type inference from schema
 */
export type AppSettingsFormData = z.infer<typeof appSettingsSchema>;

/**
 * Field group for rendering.
 */
export interface FieldGroup {
    id: string;
    isRange: boolean;
    fields: CustomizerFieldConfig[];
}

/**
 * Corner style presets
 */
export type CornerStyle = "sharp" | "modern" | "rounded";

/**
 * Shadow intensity presets
 */
export type ShadowStyle = "none" | "soft" | "strong";

/**
 * Breakpoint presets
 */
export type BreakpointPreset = "standard" | "compact" | "wide";

/**
 * Size presets for consistent sizing
 */
export type SizePreset = "small" | "medium" | "large";

/**
 * Spacing presets
 */
export type SpacingPreset = "compact" | "comfortable" | "spacious";

/**
 * Carousel navigation options
 */
export type CarouselNavigation = "none" | "arrows" | "dots" | "both";

/**
 * Customizer style state - flat structure for easy UI binding
 */
export interface CustomizerStyles {
    /** Active style preset name */
    stylePreset: string;
    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - COLORS
    // ═══════════════════════════════════════════════════════════════════
    /** Primary accent color */
    primaryColor: string;
    /** Text color */
    textColor: string;
    /** Background color */
    backgroundColor: string;
    /** Border color */
    borderColor: string;
    /** Savings/discount color */
    savingsColor: string;

    // ═══════════════════════════════════════════════════════════════════
    // APPEARANCE - SHAPE & DEPTH
    // ═══════════════════════════════════════════════════════════════════
    /** Corner style preset */
    cornerStyle: CornerStyle;
    /** Shadow preset */
    shadow: ShadowStyle;
    /** Spacing preset */
    spacing: SpacingPreset;

    // ═══════════════════════════════════════════════════════════════════
    // PRODUCT CARDS
    // ═══════════════════════════════════════════════════════════════════
    /** Enable custom card styling (false = inherit from appearance) */
    customizeCardStyle: boolean;
    /** Card background color */
    productCardBg: string;
    /** Show card border */
    productCardBorder: boolean;
    /** Show card shadow */
    productCardShadow: boolean;
    /** Image size preset */
    imageSize: SizePreset;
    /** Image fit mode */
    imageFit: "cover" | "contain";
    /** Image position (list layout) */
    imagePosition: "left" | "top";

    // ═══════════════════════════════════════════════════════════════════
    // BUTTON
    // ═══════════════════════════════════════════════════════════════════
    /** Button style */
    buttonStyle: "filled" | "outline";
    /** Button size preset */
    buttonSize: SizePreset;
    /** Button width */
    buttonWidth: "auto" | "full";
    /** Button background color (empty = inherit primary) */
    buttonBgColor: string;

    // ═══════════════════════════════════════════════════════════════════
    // BADGE
    // ═══════════════════════════════════════════════════════════════════
    /** Badge position */
    badgePosition: "top-left" | "top-right" | "inline";
    /** Badge style */
    badgeStyle: "filled" | "outline";

    // ═══════════════════════════════════════════════════════════════════
    // PRICING SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    /** Show pricing in a box/container */
    pricingSummaryBox: boolean;
    /** Pricing summary background color */
    pricingSummaryBg: string;
    /** Pricing summary visual style */
    pricingSummaryStyle: "minimal" | "card" | "highlight";

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CONTAINER
    // ═══════════════════════════════════════════════════════════════════
    /** Maximum widget width */
    boxMaxWidth: number;
    /** Widget alignment */
    boxAlignment: "left" | "center" | "right";
    /** Show widget border */
    showBorder: boolean;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════════════
    /** Heading size preset */
    headingSize: SizePreset;
    /** Body text size preset */
    bodySize: SizePreset;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - LIST LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    /** Divider style */
    dividerStyle: "none" | "line" | "plus";

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - GRID LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    /** Number of grid columns */
    gridColumns: 2 | 3 | 4;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - CAROUSEL LAYOUT
    // ═══════════════════════════════════════════════════════════════════
    /** Slides visible at once */
    slidesPerView: 2 | 3 | 4;
    /** Navigation style (combined arrows + dots) */
    carouselNavigation: CarouselNavigation;
    /** Enable autoplay */
    autoplay: boolean;
    /** Autoplay speed in seconds */
    autoplaySpeed: number;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BOGO SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** FREE tag color */
    bogoFreeTagColor: string;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BUY X GET Y SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** Tier display style */
    buyGetTierStyle: "cards" | "list" | "tabs";

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - VOLUME DISCOUNT SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** Active tier highlight color */
    volumeTierHighlightColor: string;
    /** Tier display style */
    volumeTierStyle: "table" | "cards";

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - MIX & MATCH SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** Group header color */
    mixMatchGroupHeaderColor: string;
    /** Selection indicator style */
    mixMatchSelectionStyle: "checkbox" | "radio" | "highlight";

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - FREQUENTLY BOUGHT TOGETHER SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** Separator style between products */
    fbtSeparatorStyle: "plus" | "line" | "none";
    /** Checkbox accent color */
    fbtCheckboxColor: string;

    // ═══════════════════════════════════════════════════════════════════
    // CART BANNER SPECIFIC
    // ═══════════════════════════════════════════════════════════════════
    /** Banner text color */
    cartBannerTextColor: string;
    /** Banner background color */
    cartBannerBgColor: string;
    /** Banner border color */
    cartBannerBorderColor: string;
    /** Accent color for price/savings text */
    cartBannerHighlightColor: string;
    /** Border line style */
    cartBannerBorderStyle: "solid" | "dashed" | "dotted";
    /** Corner style */
    cartBannerCornerStyle: CornerStyle;
    /** Shadow depth */
    cartBannerShadow: ShadowStyle;
    /** Inner spacing */
    cartBannerSpacing: SpacingPreset;
    /** Text size */
    cartBannerBodySize: SizePreset;
    /** Icon type for banner lines */
    cartBannerIconType:
        | "tag"
        | "percent"
        | "gift"
        | "sparkle"
        | "fire"
        | "check"
        | "none";
    /** Icon color */
    cartBannerIconColor: string;

    // ═══════════════════════════════════════════════════════════════════
    // ADVANCED - BREAKPOINTS
    // ═══════════════════════════════════════════════════════════════════
    /** Breakpoint preset */
    breakpointPreset: BreakpointPreset;
    /** Use custom pixel values instead of preset */
    customBreakpoints: boolean;
    /** Tablet breakpoint in pixels */
    tabletBreakpoint: number;
    /** Mobile breakpoint in pixels */
    mobileBreakpoint: number;

    // ═══════════════════════════════════════════════════════════════════
    // RESPONSIVE OVERRIDES
    // ═══════════════════════════════════════════════════════════════════
    /** Mobile overrides (applies < 768px) */
    mobile?: Partial<CustomizerStyles>;
    /** Tablet overrides (applies 768px - 1024px) */
    tablet?: Partial<CustomizerStyles>;
}

/**
 * Condition for showing/hiding fields based on other field values or context
 */
export interface FieldCondition {
    /** Field name to check */
    field: keyof CustomizerStyles | "_layout" | "_bundleType";
    /** Operator for comparison */
    operator: "equals" | "notEquals" | "in" | "notIn";
    /** Value(s) to compare against */
    value: string | number | boolean | Array<string | number | boolean>;
}

/**
 * Base customizer field configuration
 */
interface BaseCustomizerFieldConfig {
    name: keyof CustomizerStyles;
    label: string;
    details?: string;
    /** Conditions for showing this field */
    showWhen?: FieldCondition | FieldCondition[];
    /** Layouts where this field applies */
    layouts?: WidgetLayout[];
    bundleTypes?: BundleType[];
    /** Whether this field supports per-device overrides */
    responsive?: boolean;
}

/**
 * Color field configuration
 */
export interface ColorFieldConfig extends BaseCustomizerFieldConfig {
    type: "color";
    defaultValue?: string;
    /** If true, shows "Inherit" option that uses parent color */
    allowInherit?: boolean;
    /** Which field to inherit from */
    inheritFrom?: keyof CustomizerStyles;
}

/**
 * Number field configuration
 */
export interface CustomizerNumberFieldConfig extends BaseCustomizerFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    defaultValue?: number;
}

/**
 * Range slider field configuration
 */
export interface RangeFieldConfig extends BaseCustomizerFieldConfig {
    type: "range";
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    defaultValue?: number;
}

/**
 * Button group field configuration
 */
export interface ButtonGroupFieldConfig extends BaseCustomizerFieldConfig {
    type: "buttonGroup";
    options: Array<{
        value: string | number | boolean;
        label: string;
        icon?: string;
    }>;
    defaultValue?: string | number | boolean;
}

/**
 * Select field configuration
 */
export interface CustomizerSelectFieldConfig extends BaseCustomizerFieldConfig {
    type: "select";
    options: Array<{ value: string; label: string }>;
    defaultValue?: string;
}

/**
 * Switch/Toggle field configuration
 */
export interface CustomizerSwitchFieldConfig extends BaseCustomizerFieldConfig {
    type: "switch";
    defaultValue?: boolean;
}

/**
 * Text field configuration
 */
export interface CustomizerTextFieldConfig extends BaseCustomizerFieldConfig {
    type: "text";
    placeholder?: string;
    defaultValue?: string;
}

/**
 * Preset field - renders visual preset cards
 */
export interface PresetFieldConfig {
    type: "preset";
    name: "stylePreset";
    label: string;
    details?: string;
    presets: Record<string, StylePreset>;
    /** Conditions for showing this field */
    showWhen?: FieldCondition | FieldCondition[];
    /** Layouts where this field applies */
    layouts?: WidgetLayout[];
    bundleTypes?: BundleType[];
}

/**
 * Divider field - visual separator with optional label
 */
export interface DividerFieldConfig {
    type: "divider";
    label?: string;
    /** Conditions for showing this field */
    showWhen?: FieldCondition | FieldCondition[];
    /** Layouts where this field applies */
    layouts?: WidgetLayout[];
    /** Bundle types where this field applies */
    bundleTypes?: BundleType[];
}

/**
 * Heading field - section subheading
 */
export interface HeadingFieldConfig extends Omit<
    BaseCustomizerFieldConfig,
    "name"
> {
    type: "heading";
    label: string;
    details?: string;
    layouts?: WidgetLayout[];
    bundleTypes?: BundleType[];
}

/**
 * Union type for all customizer field configurations
 */
export type CustomizerFieldConfig =
    | ColorFieldConfig
    | CustomizerNumberFieldConfig
    | RangeFieldConfig
    | ButtonGroupFieldConfig
    | CustomizerSelectFieldConfig
    | CustomizerSwitchFieldConfig
    | CustomizerTextFieldConfig
    | PresetFieldConfig
    | DividerFieldConfig
    | HeadingFieldConfig;

/**
 * Customizer section configuration
 */
export interface CustomizerSectionConfig {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    defaultOpen?: boolean;
    fields: CustomizerFieldConfig[];
    /** Optional grid layout for fields (default: stack) */
    columns?: 1 | 2 | 3;
    /** Conditions for showing this section (AND logic) */
    showWhen?: FieldCondition | FieldCondition[];
    /** Layouts where this section applies (shorthand) */
    layouts?: WidgetLayout[];
    /** Bundle types where this section applies (shorthand) */
    bundleTypes?: BundleType[];
}

/**
 * Customizer panel configuration
 */
export interface CustomizerPanelConfig {
    id: string;
    title: string;
    sections: CustomizerSectionConfig[];
}

/**
 * Context for evaluating conditions
 */
export interface ConditionContext {
    styles: CustomizerStyles;
    activeLayout: WidgetLayout;
    activeBundleType: PreviewTemplateId;
    activeDevice: "desktop" | "tablet" | "mobile";
}

/**
 * Style preset
 */
export interface StylePreset {
    name: string;
    description: string;
    preview?: {
        primary: string;
        background: string;
        accent: string;
    };
    values: Partial<CustomizerStyles>;
}

/**
 * Style presets map
 */
export type StylePresetsMap = Record<string, StylePreset>;
