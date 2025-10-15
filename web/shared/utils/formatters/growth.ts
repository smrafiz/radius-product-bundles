import { IconProps } from "@shopify/polaris";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, } from "@shopify/polaris-icons";

/**
 * Get the appropriate growth icon based on a numeric value.
 */
export const getGrowthIcon = (value: number): IconProps["source"] => {
    if (value > 0) {
        return ArrowUpIcon;
    }

    if (value < 0) {
        return ArrowDownIcon;
    }

    return ArrowRightIcon;
};

/**
 * Get the appropriate tone for growth display based on percentage value.
 */
export const getGrowthTone = (
    value: number,
): "success" | "caution" | "subdued" => {
    if (value > 50) {
        return "success";
    }

    if (value > 10) {
        return "caution";
    }

    return "subdued";
};
