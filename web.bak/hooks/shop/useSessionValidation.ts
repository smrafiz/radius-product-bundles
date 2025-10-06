"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useCallback } from "react";
import { useSessionStore } from "@/stores";

export function useSessionValidation() {
    const app = useAppBridge();

    const {
        isValidating,
        hasValidSession,
        sessionToken,
        shop,
        sessionError,
        dispatch,
        validateSession,
        clearSession,
        isSessionExpired,
        retryValidation,
    } = useSessionStore();

    // Store App Bridge instance globally
    useEffect(() => {
        (window as any).__APP_BRIDGE__ = app;
    }, [app]);

    // Auto-validate on mount and when the session expires
    useEffect(() => {
        if (!hasValidSession || isSessionExpired()) {
            void validateSession();
        }
    }, [hasValidSession, isSessionExpired, validateSession]);

    // Periodic validation (every 4 minutes)
    useEffect(() => {
        if (hasValidSession) {
            const interval = setInterval(
                () => {
                    if (isSessionExpired()) {
                        validateSession();
                    }
                },
                4 * 60 * 1000,
            ); // 4 minutes

            return () => clearInterval(interval);
        }
    }, [hasValidSession, isSessionExpired, validateSession]);

    // Update token when App Bridge provides new one
    useEffect(() => {
        const updateToken = async () => {
            try {
                const token = await app.idToken();
                if (token && token !== sessionToken) {
                    dispatch({
                        type: "UPDATE_SESSION_TOKEN",
                        payload: { token },
                    });
                }
            } catch (error) {
                console.error("Failed to get token from App Bridge:", error);
            }
        };

        updateToken();
    }, [app, sessionToken, dispatch]);

    // Logout function
    const logout = useCallback(() => {
        clearSession();
        // Optionally redirect to auth
        window.location.href = "/api/auth";
    }, [clearSession]);

    return {
        // State from your existing store
        isValidating,
        hasValidSession,
        sessionToken,
        shop,
        error: sessionError,

        // Actions
        retryValidation,
        logout,
        validateSession,

        // Helpers
        isExpired: isSessionExpired(),
    };
}
