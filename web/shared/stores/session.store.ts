import { create } from "zustand";
import { ShopifyState, ShopifyStore } from "@/shared";

const initialState: ShopifyState = {
    shop: null,
    host: null,
    isInitialized: false,
    sessionToken: null,
    isValidating: true,
    hasValidSession: false,
    sessionError: null,
    lastValidated: null,
};

export const useSessionStore = create<ShopifyStore>()((set, get) => ({
    ...initialState,

    setParams: (shop: string | null, host: string | null) => {
        set({
            shop,
            host,
            isInitialized: true,
        });
    },

    reset: () => {
        set(initialState);
    },

    startSessionValidation: () => {
        set({
            isValidating: true,
            sessionError: null,
        });
    },

    sessionValidationSuccess: (token: string, shop?: string) => {
        set((state) => ({
            isValidating: false,
            hasValidSession: true,
            sessionToken: token,
            shop: shop || state.shop,
            sessionError: null,
            lastValidated: new Date(),
        }));
    },

    sessionValidationFailed: (error: string) => {
        set({
            isValidating: false,
            hasValidSession: false,
            sessionToken: null,
            sessionError: error,
            lastValidated: new Date(),
        });
    },

    updateSessionToken: (token: string) => {
        set({
            sessionToken: token,
            hasValidSession: true,
            lastValidated: new Date(),
        });
    },

    clearSession: () => {
        set({
            sessionToken: null,
            hasValidSession: false,
            sessionError: null,
            lastValidated: null,
        });
    },

    // Session validation method (updated to call direct methods)
    validateSession: async () => {
        const store = get();

        try {
            store.startSessionValidation();

            if (
                typeof window !== "undefined" &&
                (window as any).__APP_BRIDGE__
            ) {
                const app = (window as any).__APP_BRIDGE__;
                const token = await app.idToken();

                if (token) {
                    const response = await fetch("/api/session/validate", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.valid) {
                            store.sessionValidationSuccess(token, data.shop);
                        } else {
                            set({
                                hasValidSession: false,
                                sessionError:
                                    data.error || "Session validation failed",
                                isValidating: false,
                            });
                        }
                    } else {
                        set({
                            hasValidSession: false,
                            sessionError: "Server validation failed",
                            isValidating: false,
                        });
                    }
                } else {
                    set({
                        hasValidSession: false,
                        sessionError: "No session token available",
                        isValidating: false,
                    });
                }
            } else {
                set({
                    hasValidSession: false,
                    sessionError: "App Bridge not available",
                    isValidating: false,
                });
            }
        } catch (error) {
            store.sessionValidationFailed(
                error instanceof Error
                    ? error.message
                    : "Session validation failed",
            );
        }
    },

    isSessionExpired: () => {
        const { sessionToken } = get();

        if (!sessionToken) {
            return true;
        }

        const payload = (() => {
            try {
                const base64Payload = sessionToken.split(".")[1];
                return JSON.parse(atob(base64Payload));
            } catch {
                return null;
            }
        })();

        if (!payload?.exp) {
            return true;
        }

        const expiryTime = payload.exp * 1000;
        return Date.now() >= expiryTime;
    },

    retryValidation: async () => {
        const { validateSession } = get();
        await validateSession();
    },
}));
