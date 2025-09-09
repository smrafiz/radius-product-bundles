import type { BundleStatus, BundleType } from "@/types";
import {
    CalendarIcon,
    ChartVerticalIcon,
    CheckCircleIcon,
    ColorIcon,
    OrderIcon,
    PlusCircleIcon,
} from "@shopify/polaris-icons";

export const getBundleTypeLabel = (type: BundleType): string => {
    const typeMap: Record<BundleType, string> = {
        BUY_X_GET_Y: "Buy X Get Y",
        BOGO: "BOGO",
        VOLUME_DISCOUNT: "Volume Discount",
        MIX_AND_MATCH: "Mix & Match",
        FREQUENTLY_BOUGHT_TOGETHER: "Frequently Bought Together",
        FIXED_BUNDLE: "Fixed Bundle",
    };
    return typeMap[type] || type;
};

export const getBundleIcon = (type: BundleType) => {
    const iconMap: Record<BundleType, any> = {
        BUY_X_GET_Y: PlusCircleIcon,
        BOGO: OrderIcon,
        VOLUME_DISCOUNT: ChartVerticalIcon,
        MIX_AND_MATCH: CheckCircleIcon,
        FREQUENTLY_BOUGHT_TOGETHER: ColorIcon,
        FIXED_BUNDLE: CalendarIcon,
    };
    return iconMap[type] || OrderIcon;
};

// Helper function to get status badge props (returns props, not JSX)
export const getStatusBadgeProps = (status: BundleStatus) => {
    switch (status) {
        case "ACTIVE":
            return { tone: "success" as const, text: "Active" };
        case "DRAFT":
            return { tone: "subdued" as const, text: "Draft" };
        case "PAUSED":
            return { tone: "warning" as const, text: "Paused" };
        case "SCHEDULED":
            return { tone: "info" as const, text: "Scheduled" };
        case "ARCHIVED":
            return { tone: "critical" as const, text: "Archived" };
        default:
            return { tone: undefined, text: status };
    }
};
