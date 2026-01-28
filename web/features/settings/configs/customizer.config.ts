import { CustomizerPanelConfig } from "@/features/settings";

/**
 * Customizer panel configuration.
 */
export const CUSTOMIZER_CONFIG: CustomizerPanelConfig = {
    id: "style-customizer",
    title: "Style Customizer",
    sections: [
        // ─────────────────────────────────────────────────────────────────
        // GENERAL SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "general",
            title: "General",
            description: "Primary colors used throughout the bundle widget",
            defaultOpen: false,
            columns: 3,
            fields: [
                {
                    type: "color",
                    name: "primaryColor",
                    label: "Primary Color",
                    defaultValue: "#303030",
                },
                {
                    type: "color",
                    name: "secondaryColor",
                    label: "Secondary Color",
                    defaultValue: "#666666",
                },
                {
                    type: "color",
                    name: "textColor",
                    label: "Text Color",
                    defaultValue: "#333333",
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // BOX SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "box",
            title: "Box",
            description: "Container styling for the bundle widget",
            defaultOpen: false,
            fields: [
                {
                    type: "number",
                    name: "boxMaxWidth",
                    label: "Maximum width",
                    min: 400,
                    max: 1200,
                    step: 5,
                    defaultValue: 800,
                },
                {
                    type: "buttonGroup",
                    name: "boxAlignment",
                    label: "Alignment",
                    options: [
                        { value: "left", label: "Left" },
                        { value: "center", label: "Center" },
                        { value: "right", label: "Right" },
                    ],
                    defaultValue: "center",
                },
                {
                    type: "color",
                    name: "boxBgColor",
                    label: "Background",
                    defaultValue: "#ffffff",
                },
                {
                    type: "color",
                    name: "boxBorderColor",
                    label: "Border color",
                    defaultValue: "#e3e3e3",
                },
                {
                    type: "range",
                    name: "boxBorderWidth",
                    label: "Border width",
                    min: 0,
                    max: 5,
                    defaultValue: 1,
                },
                {
                    type: "range",
                    name: "boxRadius",
                    label: "Corner radius",
                    min: 0,
                    max: 30,
                    defaultValue: 12,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // HEADING SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "heading",
            title: "Heading",
            description: "Bundle title styling",
            defaultOpen: false,
            fields: [
                {
                    type: "buttonGroup",
                    name: "headingFontSize",
                    label: "Font size",
                    options: [
                        { value: 18, label: "Small" },
                        { value: 20, label: "Medium" },
                        { value: 22, label: "Large" },
                    ],
                    defaultValue: 20,
                },
                {
                    type: "color",
                    name: "headingColor",
                    label: "Color",
                    defaultValue: "#303030",
                },
                {
                    type: "select",
                    name: "headingTransform",
                    label: "Transform",
                    options: [
                        { value: "none", label: "Default transform" },
                        { value: "uppercase", label: "Uppercase" },
                        { value: "capitalize", label: "Capitalize" },
                    ],
                    defaultValue: "none",
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // PRODUCT SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "product",
            title: "Product",
            description: "Product card styling within the bundle",
            defaultOpen: false,
            fields: [
                {
                    type: "buttonGroup",
                    name: "productFontSize",
                    label: "Font size",
                    options: [
                        { value: 14, label: "Small" },
                        { value: 16, label: "Medium" },
                        { value: 18, label: "Large" },
                    ],
                    defaultValue: 16,
                },
                {
                    type: "color",
                    name: "productBgColor",
                    label: "Background",
                    defaultValue: "#f7f7f7",
                },
                {
                    type: "color",
                    name: "productTextColor",
                    label: "Text color",
                    defaultValue: "#333333",
                },
                {
                    type: "color",
                    name: "productBorderColor",
                    label: "Border color",
                    defaultValue: "#e3e3e3",
                },
                {
                    type: "range",
                    name: "productRadius",
                    label: "Corner radius",
                    min: 0,
                    max: 30,
                    defaultValue: 12,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // BUTTON SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "button",
            title: "Button",
            description: "Add to cart button styling",
            defaultOpen: false,
            fields: [
                {
                    type: "buttonGroup",
                    name: "buttonFontSize",
                    label: "Font size",
                    options: [
                        { value: 14, label: "Small" },
                        { value: 16, label: "Medium" },
                        { value: 18, label: "Large" },
                    ],
                    defaultValue: 16,
                },
                {
                    type: "color",
                    name: "buttonBgColor",
                    label: "Background",
                    defaultValue: "#333333",
                },
                {
                    type: "color",
                    name: "buttonTextColor",
                    label: "Text color",
                    defaultValue: "#ffffff",
                },
                {
                    type: "color",
                    name: "buttonHoverBgColor",
                    label: "Hover background",
                    defaultValue: "#666666",
                },
                {
                    type: "color",
                    name: "buttonHoverTextColor",
                    label: "Hover text color",
                    defaultValue: "#ffffff",
                },
                {
                    type: "range",
                    name: "buttonRadius",
                    label: "Corner radius",
                    min: 0,
                    max: 30,
                    defaultValue: 8,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // BADGE SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "badge",
            title: "Badge",
            description: "Savings badge styling",
            defaultOpen: false,
            fields: [
                {
                    type: "buttonGroup",
                    name: "badgeFontSize",
                    label: "Font size",
                    options: [
                        { value: 12, label: "Small" },
                        { value: 14, label: "Medium" },
                        { value: 16, label: "Large" },
                    ],
                    defaultValue: 14,
                },
                {
                    type: "color",
                    name: "badgeBgColor",
                    label: "Background",
                    defaultValue: "#333333",
                },
                {
                    type: "color",
                    name: "badgeTextColor",
                    label: "Text color",
                    defaultValue: "#ffffff",
                },
                {
                    type: "range",
                    name: "badgeRadius",
                    label: "Corner radius",
                    min: 0,
                    max: 30,
                    defaultValue: 8,
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // IMAGE SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "image",
            title: "Image",
            description: "Product image styling",
            defaultOpen: false,
            fields: [
                {
                    type: "range",
                    name: "imageRadius",
                    label: "Corner radius",
                    min: 0,
                    max: 100,
                    defaultValue: 6,
                },
                {
                    type: "range",
                    name: "imageSize",
                    label: "Size",
                    min: 40,
                    max: 300,
                    defaultValue: 80,
                },
                {
                    type: "buttonGroup",
                    name: "imageFit",
                    label: "Image fit",
                    options: [
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                    ],
                    defaultValue: "cover",
                },
            ],
        },
    ],
};
