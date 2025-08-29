import { formatCurrency } from "@/utils";
import { useShopSettingsStore } from "@/stores";

export const useCurrency = () => {
    const { getCurrencyCode, getLocale, isInitialized } = useShopSettingsStore();

    return {
        currencyCode: getCurrencyCode(),
        locale: getLocale(),
        isInitialized,
        formatPrice: (amount: number | string | null) => {
            return formatCurrency(amount, getCurrencyCode(), getLocale());
        }
    };
};