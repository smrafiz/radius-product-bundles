export function getRadius(style: "sharp" | "modern" | "rounded") {
    switch (style) {
        case "sharp":
            return "4px";
        case "rounded":
            return "20px";
        default:
            return "12px"; // modern
    }
}

export function getShadow(shadow: "none" | "soft" | "strong") {
    switch (shadow) {
        case "soft":
            return "0 4px 12px rgba(0,0,0,0.08)";
        case "strong":
            return "0 8px 24px rgba(0,0,0,0.15)";
        default:
            return "none";
    }
}

export function getSpacing(spacing: "compact" | "comfortable" | "spacious") {
    switch (spacing) {
        case "compact":
            return "8px";
        case "spacious":
            return "24px";
        default:
            return "16px";
    }
}

export function getCardRadius(style: "sharp" | "modern" | "rounded") {
    switch (style) {
        case "sharp":
            return "4px";
        case "rounded":
            return "20px";
        default:
            return "12px";
    }
}

export function getImageSize(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return 48;
        case "large":
            return 96;
        default:
            return 72;
    }
}

export function getFontSize(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "14px";
        case "large":
            return "18px";
        default:
            return "16px";
    }
}

export function getButtonRadius(style: "sharp" | "modern" | "rounded") {
    switch (style) {
        case "sharp":
            return "4px";
        case "rounded":
            return "20px";
        default:
            return "12px";
    }
}

export function getButtonFontSize(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "14px";
        case "large":
            return "18px";
        default:
            return "16px";
    }
}

export function getButtonPadding(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "8px 12px";
        case "large":
            return "16px 20px";
        default:
            return "12px 16px";
    }
}


export function getHeadingFontSize(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "18px";
        case "large":
            return "26px";
        default:
            return "22px";
    }
}

export function getBadgeRadius(style: "sharp" | "modern" | "rounded") {
    switch (style) {
        case "sharp":
            return "4px";
        case "rounded":
            return "999px";
        default:
            return "12px";
    }
}
