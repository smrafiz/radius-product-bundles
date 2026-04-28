import { CustomizerPanelConfig } from "@/features/settings";
import { STYLE_PRESETS } from "@/features/settings/constants/defaults.constants";

/**
 * Customizer panel configuration.
 */
export const CUSTOMIZER_CONFIG: CustomizerPanelConfig = {
    id: "style-customizer",
    title: "Style Customizer",
    sections: [
        // ═══════════════════════════════════════════════════════════════════
        // 1. APPEARANCE - Colors, shape, and overall feel
        // ═══════════════════════════════════════════════════════════════════
        {
            id: "appearance",
            title: "Appearance",
            icon: "palette",
            defaultOpen: true,
            showWhen: {
                field: "_bundleType",
                operator: "notEquals",
                value: "CART_BANNER",
            },
            fields: [
                // Preset selector at the very top
                {
                    type: "preset",
                    name: "stylePreset",
                    label: "Quick Start",
                    details: "Choose a preset and customize from there",
                    presets: STYLE_PRESETS,
                },

                // Colors group
                {
                    type: "heading",
                    label: "Colors",
                },
                {
                    type: "color",
                    name: "primaryColor",
                    label: "Accent color",
                    details: "Buttons, badges, and interactive elements",
                    defaultValue: "#303030",
                },
                {
                    type: "color",
                    name: "textColor",
                    label: "Text color",
                    details: "Headings, product names, and body text",
                    defaultValue: "#333333",
                },
                {
                    type: "color",
                    name: "backgroundColor",
                    label: "Background",
                    details: "Widget container background",
                    defaultValue: "#ffffff",
                },
                {
                    type: "color",
                    name: "borderColor",
                    label: "Border color",
                    details: "Borders and dividers",
                    defaultValue: "#e5e7eb",
                },
                {
                    type: "color",
                    name: "savingsColor",
                    label: "Savings color",
                    details: "Discount text and savings highlights",
                    defaultValue: "#16a34a",
                },

                // Shape & Depth group
                {
                    type: "heading",
                    label: "Shape & Depth",
                },
                {
                    type: "buttonGroup",
                    name: "cornerStyle",
                    label: "Corner roundness",
                    options: [
                        { value: "sharp", label: "Sharp" },
                        { value: "modern", label: "Modern" },
                        { value: "rounded", label: "Rounded" },
                    ],
                    defaultValue: "modern",
                },
                {
                    type: "buttonGroup",
                    name: "shadow",
                    label: "Shadow depth",
                    options: [
                        { value: "none", label: "None" },
                        { value: "soft", label: "Soft" },
                        { value: "strong", label: "Strong" },
                    ],
                    defaultValue: "soft",
                },
                {
                    type: "buttonGroup",
                    name: "spacing",
                    label: "Spacing",
                    responsive: true,
                    options: [
                        { value: "compact", label: "Compact" },
                        { value: "comfortable", label: "Comfortable" },
                        { value: "spacious", label: "Spacious" },
                    ],
                    defaultValue: "comfortable",
                },
            ],
        },

        // ═══════════════════════════════════════════════════════════════════
        // 2. PRODUCT CARDS - Card and image styling
        // ═══════════════════════════════════════════════════════════════════
        {
            id: "productCards",
            title: "Product Cards",
            icon: "product",
            defaultOpen: false,
            showWhen: {
                field: "_bundleType",
                operator: "notEquals",
                value: "CART_BANNER",
            },
            fields: [
                // Image settings (always visible)
                {
                    type: "heading",
                    label: "Images",
                },
                {
                    type: "buttonGroup",
                    name: "imageSize",
                    label: "Image size",
                    responsive: true,
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                    ],
                    defaultValue: "medium",
                },
                {
                    type: "buttonGroup",
                    name: "imageFit",
                    label: "Image fit",
                    responsive: true,
                    options: [
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                    ],
                    defaultValue: "contain",
                },
                {
                    type: "buttonGroup",
                    name: "imagePosition",
                    label: "Image position",
                    responsive: true,
                    options: [
                        { value: "left", label: "Left" },
                        { value: "top", label: "Top" },
                    ],
                    defaultValue: "left",
                    layouts: ["LIST", "CLASSIC_CARD"],
                },

                // Card customization (opt-in)
                {
                    type: "heading",
                    label: "Card Style",
                },
                {
                    type: "switch",
                    name: "customizeCardStyle",
                    label: "Customize card style",
                    details: "Override inherited styles from Appearance",
                    defaultValue: false,
                },
                {
                    type: "color",
                    name: "productCardBg",
                    label: "Card background",
                    defaultValue: "#f9fafb",
                    showWhen: {
                        field: "customizeCardStyle",
                        operator: "equals",
                        value: true,
                    },
                },
                {
                    type: "switch",
                    name: "productCardBorder",
                    label: "Show card border",
                    defaultValue: true,
                    showWhen: {
                        field: "customizeCardStyle",
                        operator: "equals",
                        value: true,
                    },
                    bundleTypes: ["FIXED_BUNDLE", "VOLUME_DISCOUNT"],
                },
                {
                    type: "switch",
                    name: "productCardShadow",
                    label: "Card shadow",
                    defaultValue: false,
                    showWhen: {
                        field: "customizeCardStyle",
                        operator: "equals",
                        value: true,
                    },
                    bundleTypes: ["FIXED_BUNDLE"],
                },
            ],
        },

        // ═══════════════════════════════════════════════════════════════════
        // 3. BUTTON & BADGE - CTA and savings styling
        // ═══════════════════════════════════════════════════════════════════
        {
            id: "buttonBadge",
            title: "Button & Badge",
            icon: "cart",
            defaultOpen: false,
            showWhen: {
                field: "_bundleType",
                operator: "notEquals",
                value: "CART_BANNER",
            },
            fields: [
                // Button group
                {
                    type: "heading",
                    label: "Add to Cart Button",
                },
                {
                    type: "buttonGroup",
                    name: "buttonStyle",
                    label: "Button style",
                    options: [
                        { value: "filled", label: "Filled" },
                        { value: "outline", label: "Outline" },
                    ],
                    defaultValue: "filled",
                },
                {
                    type: "buttonGroup",
                    name: "buttonSize",
                    label: "Button size",
                    responsive: true,
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                    ],
                    defaultValue: "medium",
                },
                {
                    type: "buttonGroup",
                    name: "buttonWidth",
                    label: "Button width",
                    options: [
                        { value: "auto", label: "Auto" },
                        { value: "full", label: "Full Width" },
                    ],
                    defaultValue: "full",
                },
                {
                    type: "color",
                    name: "buttonBgColor",
                    label: "Button color",
                    details: "Leave empty to use accent color",
                    defaultValue: "",
                    allowInherit: true,
                    inheritFrom: "primaryColor",
                },

                // Badge group (visual separator via heading)
                {
                    type: "heading",
                    label: "Savings Badge",
                },
                {
                    type: "buttonGroup",
                    name: "badgePosition",
                    label: "Badge position",
                    options: [
                        { value: "top-left", label: "Left" },
                        { value: "top-right", label: "Right" },
                        { value: "inline", label: "Inline" },
                    ],
                    defaultValue: "top-right",
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "buttonGroup",
                    name: "badgeStyle",
                    label: "Badge style",
                    options: [
                        { value: "filled", label: "Filled" },
                        { value: "outline", label: "Outline" },
                    ],
                    defaultValue: "filled",
                },
                // Pricing Summary group
                {
                    type: "heading",
                    label: "Pricing Summary",
                    layouts: ["LIST", "GRID", "CAROUSEL", "COMPACT", "SPLIT_DEAL", "CLASSIC_CARD"],
                },
                {
                    type: "switch",
                    name: "pricingSummaryBox",
                    label: "Show summary box",
                    defaultValue: true,
                    layouts: ["LIST", "GRID", "CAROUSEL", "COMPACT", "SPLIT_DEAL", "CLASSIC_CARD"],
                },
                {
                    type: "color",
                    name: "pricingSummaryBg",
                    label: "Summary background",
                    defaultValue: "#f9fafb",
                    showWhen: {
                        field: "pricingSummaryBox",
                        operator: "equals",
                        value: true,
                    },
                    layouts: ["LIST", "GRID", "CAROUSEL", "COMPACT", "SPLIT_DEAL", "CLASSIC_CARD"],
                },
                {
                    type: "buttonGroup",
                    name: "pricingSummaryStyle",
                    label: "Summary style",
                    options: [
                        { value: "minimal", label: "Minimal" },
                        { value: "card", label: "Card" },
                        { value: "highlight", label: "Highlight" },
                    ],
                    defaultValue: "card",
                    layouts: ["LIST", "GRID", "CAROUSEL", "COMPACT", "SPLIT_DEAL", "CLASSIC_CARD"],
                    showWhen: [
                        {
                            field: "pricingSummaryBox",
                            operator: "equals",
                            value: true,
                        },
                        {
                            field: "_bundleType",
                            operator: "notIn",
                            value: ["BOGO", "BUY_X_GET_Y"],
                        },
                    ],
                },
            ],
        },

        // ═══════════════════════════════════════════════════════════════════
        // 4. ADVANCED - Layout-specific and fine-tuning
        // ═══════════════════════════════════════════════════════════════════
        {
            id: "advanced",
            title: "Advanced",
            icon: "settings",
            defaultOpen: false,
            showWhen: {
                field: "_bundleType",
                operator: "notEquals",
                value: "CART_BANNER",
            },
            fields: [
                // Container settings
                {
                    type: "heading",
                    label: "Container",
                },
                {
                    type: "range",
                    name: "boxMaxWidth",
                    label: "Widget max width",
                    responsive: true,
                    suffix: "px",
                    min: 300,
                    max: 1200,
                    step: 50,
                    defaultValue: 600,
                },
                {
                    type: "buttonGroup",
                    name: "boxAlignment",
                    label: "Widget alignment",
                    responsive: true,
                    options: [
                        { value: "left", label: "Left" },
                        { value: "center", label: "Center" },
                        { value: "right", label: "Right" },
                    ],
                    defaultValue: "center",
                },
                {
                    type: "switch",
                    name: "showBorder",
                    label: "Widget border",
                    defaultValue: true,
                },

                // Breakpoints
                {
                    type: "heading",
                    label: "Breakpoints",
                },
                {
                    type: "buttonGroup",
                    name: "breakpointPreset",
                    label: "Breakpoints",
                    details:
                        "Standard (1024/768), Compact (960/640), Wide (1200/768)",
                    options: [
                        { value: "standard", label: "Standard" },
                        { value: "compact", label: "Compact" },
                        { value: "wide", label: "Wide" },
                    ],
                    defaultValue: "standard",
                },
                {
                    type: "switch",
                    name: "customBreakpoints",
                    label: "Custom breakpoint",
                    details: "Override preset with exact pixel values",
                    defaultValue: false,
                    proFeature: "custom_breakpoint",
                },
                {
                    type: "range",
                    name: "tabletBreakpoint",
                    label: "Tablet breakpoint",
                    suffix: "px",
                    min: 600,
                    max: 1200,
                    step: 10,
                    defaultValue: 1024,
                    showWhen: {
                        field: "customBreakpoints",
                        operator: "equals",
                        value: true,
                    },
                },
                {
                    type: "range",
                    name: "mobileBreakpoint",
                    label: "Mobile breakpoint",
                    suffix: "px",
                    min: 320,
                    max: 800,
                    step: 10,
                    defaultValue: 768,
                    showWhen: {
                        field: "customBreakpoints",
                        operator: "equals",
                        value: true,
                    },
                },

                // Typography
                {
                    type: "heading",
                    label: "Typography",
                },
                {
                    type: "buttonGroup",
                    name: "headingSize",
                    label: "Heading size",
                    responsive: true,
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                    ],
                    defaultValue: "medium",
                },
                {
                    type: "buttonGroup",
                    name: "bodySize",
                    label: "Body text size",
                    responsive: true,
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                    ],
                    defaultValue: "medium",
                },

                // List Layout Specific
                {
                    type: "heading",
                    label: "List Layout",
                    layouts: ["LIST"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "buttonGroup",
                    name: "dividerStyle",
                    label: "Divider style",
                    responsive: true,
                    options: [
                        { value: "none", label: "None" },
                        { value: "line", label: "Line" },
                        { value: "plus", label: "Plus" },
                    ],
                    defaultValue: "plus",
                    layouts: ["LIST"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },

                // Grid Layout Specific
                {
                    type: "heading",
                    label: "Grid Layout",
                    layouts: ["GRID"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "buttonGroup",
                    name: "gridColumns",
                    label: "Columns",
                    responsive: true,
                    options: [
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                    ],
                    defaultValue: 3,
                    layouts: ["GRID"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },

                // Carousel Layout Specific
                {
                    type: "heading",
                    label: "Slider Layout",
                    layouts: ["CAROUSEL"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "buttonGroup",
                    name: "slidesPerView",
                    label: "Slides visible",
                    responsive: true,
                    options: [
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                    ],
                    defaultValue: 3,
                    layouts: ["CAROUSEL"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "buttonGroup",
                    name: "carouselNavigation",
                    label: "Navigation",
                    responsive: true,
                    options: [
                        { value: "none", label: "None" },
                        { value: "arrows", label: "Arrows" },
                        { value: "dots", label: "Dots" },
                        { value: "both", label: "Both" },
                    ],
                    defaultValue: "both",
                    layouts: ["CAROUSEL"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "switch",
                    name: "autoplay",
                    label: "Autoplay",
                    defaultValue: false,
                    layouts: ["CAROUSEL"],
                    showWhen: {
                        field: "_bundleType",
                        operator: "notIn",
                        value: ["BOGO", "BUY_X_GET_Y"],
                    },
                },
                {
                    type: "range",
                    name: "autoplaySpeed",
                    label: "Autoplay speed",
                    suffix: "s",
                    min: 2,
                    max: 10,
                    defaultValue: 5,
                    layouts: ["CAROUSEL"],
                    showWhen: {
                        field: "autoplay",
                        operator: "equals",
                        value: true,
                    },
                },

                // BOGO Specific
                {
                    type: "heading",
                    label: "BOGO Settings",
                    layouts: ["CLASSIC_CARD"],
                    bundleTypes: ["BOGO"],
                },
                {
                    type: "color",
                    name: "bogoFreeTagColor",
                    label: "FREE tag color",
                    details: "Color of the FREE label",
                    defaultValue: "#16a34a",
                    layouts: ["CLASSIC_CARD"],
                    bundleTypes: ["BOGO"],
                },
                {
                    type: "buttonGroup",
                    name: "bogoCardBorderStyle",
                    label: "Card border style",
                    options: [
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                    ],
                    defaultValue: "solid",
                    layouts: ["CLASSIC_CARD"],
                    bundleTypes: ["BOGO"],
                },

                // Buy X Get Y Specific
                {
                    type: "heading",
                    label: "Buy X Get Y Settings",
                    bundleTypes: ["BUY_X_GET_Y"],
                    layouts: ["SPLIT_DEAL"],
                },
                {
                    type: "buttonGroup",
                    name: "splitDealStyle",
                    label: "Direction",
                    responsive: true,
                    options: [
                        { value: "column", label: "Column" },
                        { value: "row", label: "Row" },
                    ],
                    defaultValue: "row",
                    layouts: ["SPLIT_DEAL", "CLASSIC_CARD"],
                    bundleTypes: ["BUY_X_GET_Y", "BOGO"],
                },

                // Mix & Match Specific
                {
                    type: "heading",
                    label: "Mix & Match Settings",
                    bundleTypes: ["MIX_AND_MATCH"],
                },
                {
                    type: "color",
                    name: "mixMatchGroupHeaderColor",
                    label: "Group header color",
                    details: "Color for group section headings",
                    defaultValue: "#303030",
                    bundleTypes: ["MIX_AND_MATCH"],
                },
                {
                    type: "buttonGroup",
                    name: "mixMatchSelectionStyle",
                    label: "Selection style",
                    options: [
                        { value: "checkbox", label: "Checkbox" },
                        { value: "radio", label: "Radio" },
                        { value: "highlight", label: "Highlight" },
                    ],
                    defaultValue: "checkbox",
                    bundleTypes: ["MIX_AND_MATCH"],
                },

                // Frequently Bought Together Specific
                {
                    type: "heading",
                    label: "FBT Settings",
                    bundleTypes: ["FREQUENTLY_BOUGHT_TOGETHER"],
                },
                {
                    type: "buttonGroup",
                    name: "fbtSeparatorStyle",
                    label: "Separator style",
                    options: [
                        { value: "plus", label: "Plus" },
                        { value: "line", label: "Line" },
                        { value: "none", label: "None" },
                    ],
                    defaultValue: "plus",
                    bundleTypes: ["FREQUENTLY_BOUGHT_TOGETHER"],
                },
                {
                    type: "color",
                    name: "fbtCheckboxColor",
                    label: "Checkbox color",
                    details: "Color for product selection checkboxes",
                    defaultValue: "#303030",
                    bundleTypes: ["FREQUENTLY_BOUGHT_TOGETHER"],
                },
            ],
        },

        // ═══════════════════════════════════════════════════════════════════
        // 5. CART BANNER - Dedicated controls (visible only for CART_BANNER)
        // ═══════════════════════════════════════════════════════════════════
        {
            id: "cartBanner",
            title: "Cart Banner",
            icon: "notification",
            defaultOpen: true,
            showWhen: {
                field: "_bundleType",
                operator: "equals",
                value: "CART_BANNER",
            },
            fields: [
                // Colors
                {
                    type: "heading",
                    label: "Colors",
                },
                {
                    type: "color",
                    name: "cartBannerTextColor",
                    label: "Text color",
                    details: "Body text in the banner",
                    defaultValue: "#333333",
                },
                {
                    type: "color",
                    name: "cartBannerBgColor",
                    label: "Background",
                    details: "Banner container background",
                    defaultValue: "#ffffff",
                },
                {
                    type: "color",
                    name: "cartBannerBorderColor",
                    label: "Border color",
                    details: "Banner border accent",
                    defaultValue: "#303030",
                },
                {
                    type: "color",
                    name: "cartBannerHighlightColor",
                    label: "Highlight color",
                    details: "Price and savings emphasis",
                    defaultValue: "#303030",
                },

                // Shape & Depth
                {
                    type: "heading",
                    label: "Shape & Depth",
                },
                {
                    type: "buttonGroup",
                    name: "cartBannerCornerStyle",
                    label: "Corner roundness",
                    options: [
                        { value: "sharp", label: "Sharp" },
                        { value: "modern", label: "Modern" },
                        { value: "rounded", label: "Rounded" },
                    ],
                    defaultValue: "modern",
                },
                {
                    type: "buttonGroup",
                    name: "cartBannerShadow",
                    label: "Shadow depth",
                    options: [
                        { value: "none", label: "None" },
                        { value: "soft", label: "Soft" },
                        { value: "strong", label: "Strong" },
                    ],
                    defaultValue: "none",
                },
                {
                    type: "buttonGroup",
                    name: "cartBannerSpacing",
                    label: "Spacing",
                    responsive: true,
                    options: [
                        { value: "compact", label: "Compact" },
                        { value: "comfortable", label: "Comfortable" },
                        { value: "spacious", label: "Spacious" },
                    ],
                    defaultValue: "comfortable",
                },
                {
                    type: "buttonGroup",
                    name: "cartBannerBorderStyle",
                    label: "Border line",
                    options: [
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                    ],
                    defaultValue: "solid",
                },

                // Typography
                {
                    type: "heading",
                    label: "Typography",
                },
                {
                    type: "buttonGroup",
                    name: "cartBannerBodySize",
                    label: "Text size",
                    responsive: true,
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                    ],
                    defaultValue: "medium",
                },

                // Icon
                {
                    type: "heading",
                    label: "Icon",
                },
                {
                    type: "select",
                    name: "cartBannerIconType",
                    label: "Icon",
                    options: [
                        { value: "tag", label: "Price Tag" },
                        { value: "percent", label: "Percent Badge" },
                        { value: "gift", label: "Gift" },
                        { value: "sparkle", label: "Sparkle" },
                        { value: "fire", label: "Hot Deal" },
                        { value: "check", label: "Checkmark" },
                        { value: "none", label: "No Icon" },
                    ],
                    defaultValue: "tag",
                },
                {
                    type: "color",
                    name: "cartBannerIconColor",
                    label: "Icon color",
                    defaultValue: "#303030",
                },
            ],
        },
    ],
};

export const RESPONSIVE_FIELDS: ReadonlySet<string> = new Set(
    CUSTOMIZER_CONFIG.sections.flatMap((s) =>
        s.fields
            .filter((f) => "responsive" in f && f.responsive === true)
            .map((f) => (f as any).name as string),
    ),
);
