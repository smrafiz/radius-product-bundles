"use client";

import React from "react";
import { Frame } from "@shopify/polaris";

interface SimpleAppLayoutProps {
    children: React.ReactNode;
}

export default function SimpleAppLayout({ children }: SimpleAppLayoutProps) {
    return (
        <div className="radius-app-wrapper">
            <Frame>
                {children}
            </Frame>
        </div>
    );
}