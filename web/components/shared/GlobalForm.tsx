"use client";

import React, { useRef, useEffect } from "react";

interface Props {
    children: React.ReactNode;
    onSubmit?: () => Promise<void> | void;
    isDirty: boolean;
    resetDirty: () => void;
}

export default function GlobalForm({ children, onSubmit, isDirty, resetDirty }: Props) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;

        // Add the official Save Bar attributes
        form.dataset.saveBar = "true";
        form.dataset.discardConfirmation = "true";

        // Subscribe to save (submit) event
        const handleSubmit = async (e: Event) => {
            e.preventDefault();
            if (onSubmit) await onSubmit();
            resetDirty();
        };

        // Subscribe to discard (reset) event
        const handleReset = () => {
            resetDirty();
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