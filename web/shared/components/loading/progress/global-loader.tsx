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
        stopLoading()
    }, [pathname]);

    useEffect(() => {
        const links = document.querySelectorAll("a[data-sprogress]");
        const buttons = document.querySelectorAll("button[data-sprogress]");
        const handleClick = () => startLoading();

        links.forEach((el) => el.addEventListener("click", handleClick));
        buttons.forEach((el) => el.addEventListener("click", handleClick));

        return () => {
            links.forEach((el) => el.removeEventListener("click", handleClick));
            buttons.forEach((el) =>
                el.removeEventListener("click", handleClick),
            );
        };
    }, []);

    return null;
}
