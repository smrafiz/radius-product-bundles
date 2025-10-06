export type ShopifyState = {
    shop: string | null;
    host: string | null;
    isInitialized: boolean;
    sessionToken: string | null;
    isValidating: boolean;
    hasValidSession: boolean;
    sessionError: string | null;
    lastValidated: Date | null;
};

export type Action =
    | { type: "SET_PARAMS"; payload: { shop: string; host: string } }
    | { type: "RESET" }
    | { type: "START_SESSION_VALIDATION" }
    | {
          type: "SESSION_VALIDATION_SUCCESS";
          payload: { token: string; shop?: string };
      }
    | { type: "SESSION_VALIDATION_FAILED"; payload: { error: string } }
    | { type: "UPDATE_SESSION_TOKEN"; payload: { token: string } }
    | { type: "CLEAR_SESSION" };

export const initialState: ShopifyState = {
    shop: null,
    host: null,
    isInitialized: false,
    sessionToken: null,
    isValidating: true,
    hasValidSession: false,
    sessionError: null,
    lastValidated: null,
};

export function sessionReducer(
    state: ShopifyState,
    action: Action,
): ShopifyState {
    switch (action.type) {
        case "SET_PARAMS":
            return {
                ...state,
                shop: action.payload.shop,
                host: action.payload.host,
                isInitialized: true,
            };

        case "RESET":
            return initialState;

        case "START_SESSION_VALIDATION":
            return {
                ...state,
                isValidating: true,
                sessionError: null,
            };

        case "SESSION_VALIDATION_SUCCESS":
            return {
                ...state,
                isValidating: false,
                hasValidSession: true,
                sessionToken: action.payload.token,
                shop: action.payload.shop || state.shop,
                sessionError: null,
                lastValidated: new Date(),
            };

        case "SESSION_VALIDATION_FAILED":
            return {
                ...state,
                isValidating: false,
                hasValidSession: false,
                sessionToken: null,
                sessionError: action.payload.error,
                lastValidated: new Date(),
            };

        case "UPDATE_SESSION_TOKEN":
            return {
                ...state,
                sessionToken: action.payload.token,
                hasValidSession: true,
                lastValidated: new Date(),
            };

        case "CLEAR_SESSION":
            return {
                ...state,
                sessionToken: null,
                hasValidSession: false,
                sessionError: null,
                lastValidated: null,
            };

        default:
            return state;
    }
}
