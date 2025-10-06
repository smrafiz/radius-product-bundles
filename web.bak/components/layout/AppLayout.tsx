"use client";

import { ReactNode } from "react";
import { Frame } from "@shopify/polaris";

export default function AppLayoutWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="radius-app-wrapper">
            <Frame>{children}</Frame>
        </div>
    );
}
