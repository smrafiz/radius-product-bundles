import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
} from "@shopify/polaris-icons";

export const getGrowthIcon = (value: number) => {
    if (value > 0) return ArrowUpIcon;
    if (value < 0) return ArrowDownIcon;
    return ArrowRightIcon;
};

export const getGrowthTone = (value: number) => {
    if (value >= 50) return "success";
    if (value >= 10) return "caution";
    return "subdued";
};