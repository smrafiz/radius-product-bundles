"use client";

import "nprogress/nprogress.css";
import NProgress from "nprogress";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.05 });

export default function GlobalLoader() {
    const pathname = usePathname();

    useEffect(() => {
        NProgress.done();
    }, [pathname]);

    const startLoader = () => {
        NProgress.start();
    };

    useEffect(() => {
        // Links with data-nprogress
        const links = document.querySelectorAll("a[data-nprogress]");
        const handleLinkClick = () => startLoader();
        links.forEach(link => link.addEventListener("click", handleLinkClick));

        // Buttons that trigger navigation (optional: add data-nprogress)
        const buttons = document.querySelectorAll("button[data-nprogress]");
        const handleButtonClick = () => startLoader();
        buttons.forEach(btn => btn.addEventListener("click", handleButtonClick));

        // Cleanup
        return () => {
            links.forEach(link => link.removeEventListener("click", handleLinkClick));
            buttons.forEach(btn => btn.removeEventListener("click", handleButtonClick));
        };
    }, []);

    return null;
}