"use client";

import {
    useBundleFormMethods,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useEffect } from "react";

export function BundleDetails() {
    const { watch, setValue, trigger } = useBundleFormMethods();
    const { getFieldError } = useBundleValidation();
    const { markDirty, validationAttempted } = useBundleStore();

    const name = watch("name");
    const description = watch("description");

    useEffect(() => {
        if (validationAttempted && !name) {
            void trigger("name");
        }
    }, [validationAttempted, name, trigger]);

    const handleNameChange = (value: string) => {
        setValue("name", value, { shouldValidate: true, shouldDirty: true });
        markDirty();
    };

    const handleDescriptionChange = (value: string) => {
        setValue("description", value, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();
    };

    return (
        <s-stack gap="base">
            <s-heading>Bundle details</s-heading>
            <s-stack>
                <s-tooltip id="info-tooltip">This is info tooltip</s-tooltip>
                <s-text-field
                    label="Bundle name"
                    value={name || ""}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        handleNameChange(target.value);
                    }}
                    placeholder="Enter bundle name"
                    details="Used internally to identify the bundle."
                    error={getFieldError("name")}
                ></s-text-field>
            </s-stack>

            <s-text-area
                label="Description (Optional)"
                value={description || ""}
                onChange={(event: Event) => {
                    const target = event.target as HTMLTextAreaElement;
                    handleDescriptionChange(target.value);
                }}
                rows={3}
                placeholder="Describe your bundle offer"
                error={getFieldError("description")}
            />
        </s-stack>
    );
}
