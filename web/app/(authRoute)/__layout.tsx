import React from "react";
import { useSessionStore } from "@/lib/stores/sessionStore";

const ProviderLayout = ({ children }: { children: React.ReactNode }) => {
    const { shop, host, isInitialized } = useSessionStore();
    if (!isInitialized || !shop || !host) {
        return <h1>Missing Shop and Host Parameters</h1>;
    }
    return <>{children}</>;
};

export default ProviderLayout;
