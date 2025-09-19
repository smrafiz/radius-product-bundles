"use client";

import { useBundleStore } from "@/stores";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { BundleFormData } from "@/lib/validation";
import { withLoader } from "@/utils";

interface Props {
    children: ReactNode;
    onSubmit?: (data: BundleFormData) => Promise<void> | void;
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
    const form = useFormContext<BundleFormData>();

    const isDirty = useBundleStore((s) => s.isDirty);

    useEffect(() => {
        const formElement = formRef.current;
        if (!formElement) return;

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
            if (form) {
                form.reset();
            }
            resetDirty();

            if (discardPath) {
                NProgress.start();
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
