'use client';

import { Page } from "@shopify/polaris";
import React from "react";
import { useShopifyStore } from "@/lib/stores/shopify";

export default function NewPage() {
    const { shop, host, isInitialized } = useShopifyStore();

    if (!isInitialized || !shop || !host) {
        return <h1>Missing Shop and Host Parameters</h1>;
    }

    return (
        <Page title="New">
            <div className="flex items-center justify-center gap-1 p-2 bg-slate-800 text-white rounded-lg mb-2 shadow-lg">
                <p className="font-medium text-[1rem]">
                    The app is installed on {" "}
                    <span className="font-bold">{shop}</span>
                </p>
            </div>
        </Page>
    );
}