import { formatCurrency, getCurrencySymbol } from "@/shared";
import {
    BundleListItem,
    DISCOUNT_TYPES,
    DiscountType,
} from "@/features/bundles";

/*
 * Format bundle type
 */
export const formatBundleType = (type: string) => {
    return type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

/*
 * Bundle currency formatter
 */
export function bundleCurrencyFormatter(
    currencyCode?: string,
    isLoading?: boolean,
): (value: number) => string {
    const currencySymbol = getCurrencySymbol(currencyCode);

    return (value: number) => {
        if (isLoading && !currencyCode) {
            return "•";
        }

        return `${currencySymbol}${value}`;
    };
}

/*
 * Format bundle discount
 */
export function formatBundleDiscount(
    bundle: BundleListItem,
    currencyFormatter?: (value: number) => string,
    currencyCode?: string,
    locale?: string,
): string {
    if (!bundle.discountType) {
        return "No Discount";
    }

    const config = DISCOUNT_TYPES[bundle.discountType];

    if (!config) {
        return "No Discount";
    }

    const formatter =
        currencyFormatter ||
        ((value: number) => formatCurrency(value, currencyCode, locale));

    const baseDiscount = config.format(bundle.discountValue, formatter);

    // Type-aware formatting
    switch (bundle.type) {
        case "BOGO":
        case "BUY_X_GET_Y": {
            const prods = bundle.products as Array<any>;
            let buyCount = 1;
            let getCount = 1;
            if (prods?.length) {
                const triggers = prods.reduce(
                    (sum: number, p: any) =>
                        p.role === "TRIGGER" ? sum + (p.quantity || 1) : sum,
                    0,
                );
                const rewards = prods.reduce(
                    (sum: number, p: any) =>
                        p.role === "REWARD" ? sum + (p.quantity || 1) : sum,
                    0,
                );
                if (triggers > 0 && rewards > 0) {
                    buyCount = triggers;
                    getCount = rewards;
                } else {
                    // Legacy: all INCLUDED — derive from product count
                    buyCount = Math.max(prods.length - 1, 1);
                    getCount = 1;
                }
            }
            return `B${buyCount}G${getCount} ${baseDiscount}`;
        }
        case "VOLUME_DISCOUNT": {
            if (bundle.discountType === "NO_DISCOUNT") return baseDiscount;
            const tiers = bundle.volumeTiers?.tiers;
            if (tiers?.length) {
                const maxDiscount = Math.max(
                    ...tiers.map((t) => t.discount || 0),
                );
                if (maxDiscount > 0) {
                    const tierConfig = DISCOUNT_TYPES[bundle.discountType];
                    const formatted = tierConfig
                        ? tierConfig.format(maxDiscount, formatter)
                        : `${maxDiscount}% Off`;
                    return `Up to ${formatted}`;
                }
            }
            return `Up to ${baseDiscount}`;
        }
        default:
            return baseDiscount;
    }
}

/*
 * Format bundle discount from value
 */
export function formatDiscountFromValues(
    discountType?: DiscountType,
    discountValue?: number,
    currencyFormatter?: (value: number) => string,
    currencyCode?: string,
    locale?: string,
): string {
    if (!discountType || !(discountType in DISCOUNT_TYPES)) {
        return "No Discount";
    }

    const config = DISCOUNT_TYPES[discountType];

    const formatter =
        currencyFormatter ||
        ((value: number) => formatCurrency(value, currencyCode, locale));

    return config.format(discountValue ?? 0, formatter, false);
}

/**
 * Format price for display using shop currency
 */
export function formatPrice(price: number, currencyCode?: string): string {
    if (!currencyCode) {
        return `• ${price.toFixed(2)}`;
    }

    return formatCurrency(price, currencyCode);
}
