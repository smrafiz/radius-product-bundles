import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    Action,
    initialState,
    ShopifyState,
    shopifyReducer,
} from "../reducers/shopify";

type ShopifyStore = ShopifyState & {
    dispatch: (action: Action) => void;
};

export const useShopifyStore = create<ShopifyStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            dispatch: (action: Action) => {
                const newState = shopifyReducer(get(), action);
                set(newState);
            },
        }),
        {
            name: "sd-shopify-product-notes",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
