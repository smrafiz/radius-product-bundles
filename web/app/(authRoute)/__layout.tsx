import React from "react";
import { useShopifyStore } from "@/lib/stores/shopify";

const ProviderLayout = ({ children }: { children: React.ReactNode }) => {
    const { shop, host, isInitialized } = useShopifyStore();
    if (!isInitialized || !shop || !host) {
        return <h1>Missing Shop and Host Parameters</h1>;
    }
    return <>{children}</>;
};

export default ProviderLayout;
