import { CustomizerPanelConfig } from "@/features/settings";
import { STYLE_PRESETS } from "@/features/settings/constants/defaults.constants";

/**
 * Customizer panel configuration.
 *
 * 4-section structure focused on STYLING:
 * 1. Appearance - Colors, shape, and overall feel
 * 2. Product Cards - Card and image styling
 * 3. Button & Badge - CTA and savings styling (with visual separation)
 * 4. Advanced - Layout-specific and fine-tuning options
 *
 * Key UX principles applied:
 * - Presets at top for quick start
 * - Preset-based controls (Sharp/Modern/Rounded) prevent "ugly" values
 * - Progressive disclosure for power users
 * - Visual separators between related groups
 * - Conditional fields based on layout/bundle type
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
                    options: [
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                    ],
                    defaultValue: "cover",
                },
                {
                    type: "buttonGroup",
                    name: "imagePosition",
                    label: "Image position",
                    options: [
                        { value: "left", label: "Left" },
                        { value: "top", label: "Top" },
                    ],
                    defaultValue: "left",
                    layouts: ["LIST"],
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
                    details: "Background color of product cards",
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
                    details: "Display border around product cards",
                    defaultValue: true,
                    showWhen: {
                        field: "customizeCardStyle",
                        operator: "equals",
                        value: true,
                    },
                },
                {
                    type: "switch",
                    name: "productCardShadow",
                    label: "Card shadow",
                    details: "Add shadow to product cards",
                    defaultValue: false,
                    showWhen: {
                        field: "customizeCardStyle",
                        operator: "equals",
                        value: true,
                    },
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
                        { value: "top-left", label: "Top Left" },
                        { value: "top-right", label: "Top Right" },
                        { value: "inline", label: "Inline" },
                    ],
                    defaultValue: "top-right",
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
                    details: "Maximum width of the bundle widget",
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
                    details: "Show border around the widget",
                    defaultValue: true,
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
                },
                {
                    type: "buttonGroup",
                    name: "dividerStyle",
                    label: "Divider style",
                    options: [
                        { value: "none", label: "None" },
                        { value: "line", label: "Line" },
                        { value: "plus", label: "Plus" },
                    ],
                    defaultValue: "plus",
                    layouts: ["LIST"],
                },

                // Grid Layout Specific
                {
                    type: "heading",
                    label: "Grid Layout",
                    layouts: ["GRID"],
                },
                {
                    type: "buttonGroup",
                    name: "gridColumns",
                    label: "Columns",
                    options: [
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                    ],
                    defaultValue: 3,
                    layouts: ["GRID"],
                },

                // Carousel Layout Specific
                {
                    type: "heading",
                    label: "Slider Layout",
                    layouts: ["CAROUSEL"],
                },
                {
                    type: "buttonGroup",
                    name: "slidesPerView",
                    label: "Slides visible",
                    options: [
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                    ],
                    defaultValue: 3,
                    layouts: ["CAROUSEL"],
                },
                {
                    type: "buttonGroup",
                    name: "carouselNavigation",
                    label: "Navigation",
                    options: [
                        { value: "none", label: "None" },
                        { value: "arrows", label: "Arrows" },
                        { value: "dots", label: "Dots" },
                        { value: "both", label: "Both" },
                    ],
                    defaultValue: "both",
                    layouts: ["CAROUSEL"],
                },
                {
                    type: "switch",
                    name: "autoplay",
                    label: "Autoplay",
                    details: "Auto-advance slides",
                    defaultValue: false,
                    layouts: ["CAROUSEL"],
                },
                {
                    type: "range",
                    name: "autoplaySpeed",
                    label: "Autoplay speed",
                    details: "Seconds between slides",
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
                    bundleTypes: ["BOGO"],
                },
                {
                    type: "color",
                    name: "bogoFreeTagColor",
                    label: "FREE tag color",
                    details: "Color of the FREE label",
                    defaultValue: "#16a34a",
                    bundleTypes: ["BOGO"],
                },

                // Buy X Get Y Specific
                {
                    type: "heading",
                    label: "Buy X Get Y Settings",
                    bundleTypes: ["BUY_X_GET_Y"],
                },
                {
                    type: "buttonGroup",
                    name: "buyGetTierStyle",
                    label: "Tier display",
                    options: [
                        { value: "cards", label: "Cards" },
                        { value: "list", label: "List" },
                        { value: "tabs", label: "Tabs" },
                    ],
                    defaultValue: "cards",
                    bundleTypes: ["BUY_X_GET_Y"],
                },
            ],
        },
    ],
};
