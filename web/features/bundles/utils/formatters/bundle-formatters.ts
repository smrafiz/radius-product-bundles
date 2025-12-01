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

    return config.format(bundle.discountValue, formatter);
}

/*
 * Format bundle discount from value
 */
export function formatDiscountFromValues(
    discountType?: DiscountType,
    discountValue?: number,
    currencyFormatter?: (value: number) => string,
    currencyCode?: string,
    locale?: string
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
 * Format price for display
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}
