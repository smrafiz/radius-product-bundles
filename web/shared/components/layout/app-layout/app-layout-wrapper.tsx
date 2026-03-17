"use client";

import { usePathname } from "next/navigation";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { Navigation } from "@/shared/components/navigation/navigation";

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

    return (
        <>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            {children}
        </>
    );
}
