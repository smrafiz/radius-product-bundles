import { create } from "zustand";

interface Shop {
    domain: string;
}

interface ShopStoreState {
    shop: Shop | null;
    setShop: (domain: string) => void;
    clearShop: () => void;
}

export const useShopStore = create<ShopStoreState>()((set) => ({
    shop: null,

    setShop: (domain: string) => {
        set({ shop: { domain } });
    },

    clearShop: () => {
        set({ shop: null });
    },
}));
