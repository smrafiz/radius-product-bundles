"use client";

import React from "react";
import { Page } from "@shopify/polaris";
import { useSessionStore } from "@/lib/stores/sessionStore";

export default function BundlesPage() {
    const { shop, host, isInitialized } = useSessionStore();

    if (!isInitialized || !shop || !host) {
        return <h1>Missing Shop and Host Parameters</h1>;
    }

    return (
        <Page title="Bundles" subtitle="Manage your product bundles">
            <div className="flex items-center justify-center p-8">
                <p>Bundle management coming soon...</p>
            </div>
        </Page>
    );
}
