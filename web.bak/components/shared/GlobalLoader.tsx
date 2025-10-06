"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
    const pathname = usePathname();

    // Hide the loader when the path changes (route finished)
    useEffect(() => {
        if (window.shopify?.loading) {
            window.shopify.loading(false);
        }
    }, [pathname]);

    const startLoader = () => {
        if (window.shopify?.loading) {
            window.shopify.loading(true);
        }
    };

    useEffect(() => {
        // Links with data-sprogress
        const links = document.querySelectorAll("a[data-sprogress]");
        const handleLinkClick = () => startLoader();
        links.forEach((link) =>
            link.addEventListener("click", handleLinkClick)
        );

        // Buttons that trigger navigation
        const buttons = document.querySelectorAll("button[data-sprogress]");
        const handleButtonClick = () => startLoader();
        buttons.forEach((btn) =>
            btn.addEventListener("click", handleButtonClick)
        );

        // Cleanup
        return () => {
            links.forEach((link) =>
                link.removeEventListener("click", handleLinkClick)
            );
            buttons.forEach((btn) =>
                btn.removeEventListener("click", handleButtonClick)
            );
        };
    }, []);

    return null;
}