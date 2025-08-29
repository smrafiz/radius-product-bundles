import {
    Action,
    initialState,
    sessionReducer,
    ShopifyState,
} from "@/lib/reducers/session";
import { create } from "zustand";

type ShopifyStore = ShopifyState & {
    dispatch: (action: Action) => void;
    validateSession: () => Promise<void>;
    clearSession: () => void;
    isSessionExpired: () => boolean;
    retryValidation: () => Promise<void>;
};

/**
 * Create a store for managing the session state
 */
export const useSessionStore = create<ShopifyStore>()((set, get) => ({
    ...initialState,

    dispatch: (action: Action) => {
        const newState = sessionReducer(get(), action);
        set(newState);
    },

    // Session validation method
    validateSession: async () => {
        const { dispatch } = get();

        try {
            dispatch({ type: "START_SESSION_VALIDATION" });

            if (
                typeof window !== "undefined" &&
                (window as any).__APP_BRIDGE__
            ) {
                const app = (window as any).__APP_BRIDGE__;
                const token = await app.idToken();

                if (token) {
                    // Use the new validation API
                    const response = await fetch(
                        "/api/validate-session",
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    if (response.ok) {
                        const data = await response.json();

                        if (data.valid) {
                            dispatch({
                                type: "SESSION_VALIDATION_SUCCESS",
                                payload: {
                                    token,
                                    shop: data.shop,
                                },
                            });
                        } else {
                            throw new Error(
                                data.error ||
                                    "Session validation failed",
                            );
                        }
                    } else {
                        throw new Error("Server validation failed");
                    }
                } else {
                    throw new Error("No session token available");
                }
            } else {
                throw new Error("App Bridge not available");
            }
        } catch (error) {
            dispatch({
                type: "SESSION_VALIDATION_FAILED",
                payload: {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Session validation failed",
                },
            });
        }
    },

    // Clear session
    clearSession: () => {
        const { dispatch } = get();
        dispatch({ type: "CLEAR_SESSION" });
    },

    // Check if the session is expired (5 minutes)
    isSessionExpired: () => {
        const { lastValidated } = get();
        if (!lastValidated) return true;

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(lastValidated) < fiveMinutesAgo;
    },

    // Retry validation
    retryValidation: async () => {
        const { validateSession } = get();
        await validateSession();
    },
}));
