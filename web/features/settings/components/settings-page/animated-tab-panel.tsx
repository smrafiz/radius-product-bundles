"use client";

import { ReactNode, useMemo } from "react";

function useReducedMotion(): boolean {
    return useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
}

export function AnimatedTabPanel({
    tabKey,
    children,
}: {
    tabKey: string;
    children: ReactNode;
}) {
    const reducedMotion = useReducedMotion();

    return (
        <div
            key={tabKey}
            style={reducedMotion ? undefined : { animation: "rpbTabSlide 0.22s ease-out" }}
        >
            {children}
        </div>
    );
}
