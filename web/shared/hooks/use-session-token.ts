import { useAppBridge } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";

/**
 * Get the session token from Shopify App Bridge
 */
export function useSessionToken() {
    const app = useAppBridge();
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        const getToken = async () => {
            try {
                const sessionToken = await app.idToken();
                setToken(sessionToken);
            } catch (error) {
                console.error("Failed to get session token:", error);
            }
        };

        void getToken();
    }, [app]);

    return token;
}
