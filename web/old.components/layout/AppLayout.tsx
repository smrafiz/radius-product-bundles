"use client";

import { ReactNode } from "react";
import { Frame } from "@shopify/polaris";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayoutWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className={`radius-app-wrapper ${inter.className}`}>
            <Frame>{children}</Frame>
        </div>
    );
}
