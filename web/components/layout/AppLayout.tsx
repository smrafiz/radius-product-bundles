"use client";

import React from "react";
import { Frame } from "@shopify/polaris";

export default function AppLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="radius-app-wrapper">
            <Frame>{children}</Frame>
        </div>
    );
}
