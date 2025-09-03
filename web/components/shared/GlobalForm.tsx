"use client";

import NProgress from "nprogress";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect } from "react";

interface Props {
    children: React.ReactNode;
    onSubmit?: () => Promise<void> | void;
    resetDirty: () => void;
    discardPath?: string;
}

export default function GlobalForm({ children, onSubmit, resetDirty, discardPath }: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        const form = formRef.current;

        if (!form) {
            return;
        }

        form.dataset.saveBar = "true";
        form.dataset.discardConfirmation = "true";

        // Subscribe to the save (submit) event
        const handleSubmit = async (e: Event) => {
            e.preventDefault();

            if (onSubmit) {
                await onSubmit();
            }

            resetDirty();
        };

        // Subscribe to discard (reset) event
        const handleReset = () => {
            form.reset();
            resetDirty();

            if (discardPath) {
                NProgress.start();
                router.push(discardPath);
            }
        };

        form.addEventListener("submit", handleSubmit);
        form.addEventListener("reset", handleReset);

        return () => {
            form.removeEventListener("submit", handleSubmit);
            form.removeEventListener("reset", handleReset);
        };
    }, [onSubmit, resetDirty]);

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            {children}
        </form>
    );
}