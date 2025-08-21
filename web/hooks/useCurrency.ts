import { formatCurrency } from "@/utils";
import { useShopSettingsStore } from "@/lib/stores/useShopSettingsStore";

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