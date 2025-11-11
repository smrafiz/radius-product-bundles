"use client";

import { ReactNode } from "react";
import { Frame } from "@shopify/polaris";

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="radius-app-wrapper" suppressHydrationWarning>
            <Frame>{children}</Frame>
        </div>
    );
}
