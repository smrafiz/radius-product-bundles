"use client";

import { getSessionToken } from "@/shared";
import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Get the session token from Shopify App Bridge
 */
export function useSessionToken() {
    const app = useAppBridge();
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        void getSessionToken(app)
            .then(setToken)
            .catch((error) => console.error("Failed to get session token:", error));
    }, [app]);

    return token;
}
