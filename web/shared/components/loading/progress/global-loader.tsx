"use client";

import NProgress from "nprogress";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { startLoading, stopLoading } from "@/shared";

import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.08 });

export function GlobalLoader() {
    const pathname = usePathname();

    useEffect(() => {
        stopLoading();
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (
                el.closest?.("a[data-sprogress]") ||
                el.closest?.("button[data-sprogress]")
            ) {
                startLoading();
            }
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, []);

    return null;
}
