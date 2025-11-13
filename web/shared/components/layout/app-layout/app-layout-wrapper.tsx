"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * App Layout Wrapper
 *
 * Wraps app content and prevents hydration errors for web components
 */
export function AppLayoutWrapper({ children }: { children: ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}