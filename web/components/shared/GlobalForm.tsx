"use client";

import NProgress from "nprogress";
import { useBundleStore } from "@/stores";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

interface Props {
    children: ReactNode;
    onSubmit?: () => Promise<void> | void;
    resetDirty: () => void;
    discardPath?: string;
}

export default function GlobalForm({
    children,
    onSubmit,
    resetDirty,
    discardPath,
}: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const isDirty = useBundleStore((s) => s.isDirty);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;

        form.dataset.saveBar = "true";
        form.dataset.discardConfirmation = "true";

        const handleSubmit = async (e: Event) => {
            e.preventDefault();

            if (onSubmit) {
                await onSubmit();
            }

            resetDirty();
        };

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
    }, [onSubmit, resetDirty, discardPath, router]);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;

        form.dataset.dirty = isDirty ? "true" : "false";
    }, [isDirty]);

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            {children}
        </form>
    );
}
