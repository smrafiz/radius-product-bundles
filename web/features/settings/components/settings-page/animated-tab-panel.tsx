"use client";

import { ReactNode } from "react";

export function AnimatedTabPanel({
    tabKey,
    children,
}: {
    tabKey: string;
    children: ReactNode;
}) {
    return (
        <div
            key={tabKey}
            style={{ animation: "rpbTabSlide 0.22s ease-out" }}
        >
            {children}
        </div>
    );
}
