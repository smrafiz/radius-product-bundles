"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBundleStore } from "@/features/bundles";
import { GlobalFormProps, withLoader } from "@/shared";
import { FieldValues, useFormContext } from "react-hook-form";

/**
 * A reusable global form wrapper compatible with any React Hook Form context.
 * Handles save bar, discard confirmation, and Shopify loading states.
 */
export function GlobalForm<T extends FieldValues>({
    children,
    onSubmit,
    resetDirty,
    discardPath,
}: GlobalFormProps<T>) {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const form = useFormContext<T>();
    const isDirty = useBundleStore((s) => s.isDirty);

    useEffect(() => {
        const formElement = formRef.current;
        if (!formElement) {
            return;
        }

        formElement.dataset.saveBar = "true";
        formElement.dataset.discardConfirmation = "true";

        const handleSubmit = async (e: Event) => {
            e.preventDefault();

            if (onSubmit && form) {
                await form.handleSubmit(
                    (data) =>
                        withLoader(async () => {
                            console.log("GlobalForm submitting data:", data);
                            await onSubmit(data);
                            window.shopify.loading(false);
                            resetDirty();
                        })(),
                    (errors) => {
                        console.log("GlobalForm validation errors:", errors);
                        resetDirty();
                        window.shopify.loading(false);
                    },
                )();
            }
        };

        const handleReset = () => {
            form?.reset();
            resetDirty();

            if (discardPath) {
                window.shopify.loading(true);
                router.push(discardPath);
            }
        };

        formElement.addEventListener("submit", handleSubmit);
        formElement.addEventListener("reset", handleReset);

        return () => {
            formElement.removeEventListener("submit", handleSubmit);
            formElement.removeEventListener("reset", handleReset);
        };
    }, [onSubmit, resetDirty, discardPath, router, form]);

    useEffect(() => {
        const formElement = formRef.current;
        if (!formElement) return;
        formElement.dataset.dirty = isDirty ? "true" : "false";
    }, [isDirty]);

    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            {children}
        </form>
    );
}
