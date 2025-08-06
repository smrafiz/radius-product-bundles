"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { doWebhookRegistration, storeToken } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import { useShopifyStore } from "@/lib/stores/shopify";

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const app = useAppBridge();
    const searchParams = useSearchParams();
    const dispatch = useShopifyStore((state) => state.dispatch);
    const isInitialized = useShopifyStore((state) => state.isInitialized);

    useEffect(() => {
        app.idToken().then((token) => {
            storeToken(token)
                .then(() => {
                    console.log("Token stored");
                })
                .catch((error) => {
                    console.error("Error storing token", error);
                });
            doWebhookRegistration(token)
                .then(() => {
                    console.log("Webhook registered");
                })
                .catch((error) => {
                    console.error("Error registering webhook", error);
                });
        });
    }, [app]);

    useEffect(() => {
        const shop = searchParams.get("shop");
        const host = searchParams.get("host");

        if (!isInitialized && shop && host) {
            dispatch({ type: "SET_PARAMS", payload: { shop, host } });
        }
    }, [dispatch, isInitialized, searchParams]);

    return <>{children}</>;
}
