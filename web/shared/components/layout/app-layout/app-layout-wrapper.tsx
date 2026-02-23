"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

/**
 * App Layout Wrapper
 *
 * Wraps app content and prevents hydration errors for web components
 */
export function AppLayoutWrapper({ children }: { children: ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}
