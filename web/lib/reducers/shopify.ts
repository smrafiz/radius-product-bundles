export type ShopifyState = {
    shop: string | null;
    host: string | null;
    isInitialized: boolean;
};

export type Action =
    | { type: "SET_PARAMS"; payload: { shop: string; host: string } }
    | { type: "RESET" };

export const initialState: ShopifyState = {
    shop: null,
    host: null,
    isInitialized: false,
};

export function shopifyReducer(
    state: ShopifyState,
    action: Action,
): ShopifyState {
    switch (action.type) {
        case "SET_PARAMS":
            return {
                shop: action.payload.shop,
                host: action.payload.host,
                isInitialized: true,
            };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}
