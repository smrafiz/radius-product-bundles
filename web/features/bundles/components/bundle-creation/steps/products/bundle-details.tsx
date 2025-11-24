"use client";

import {
    BundleType,
    useBundleField,
    useBundleFormManager,
    useBundleValidation,
} from "@/features/bundles";

/**
 * Bundle details input component for name and description
 */
export function BundleDetails({ bundleType }: { bundleType: BundleType }) {
    const { getFieldError } = useBundleValidation();
    const { isGeneratingName } = useBundleFormManager({
        bundleType,
        bundleName: "",
    });

    const nameField = useBundleField<string>("name");
    const descriptionField = useBundleField<string>("description");

    return (
        <s-stack gap="base">
            <s-heading>Bundle details</s-heading>
            <s-stack>
                <s-text-field
                    label="Bundle name"
                    value={nameField.value || ""}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        nameField.handleChange(target.value);
                    }}
                    placeholder={
                        isGeneratingName
                            ? "Generating unique name..."
                            : "Enter bundle name"
                    }
                    details="Unique identifier for your bundle."
                    error={getFieldError("name")}
                    disabled={isGeneratingName}
                    required
                ></s-text-field>
            </s-stack>

            <s-text-area
                label="Description"
                value={descriptionField.value || ""}
                onChange={(event: Event) => {
                    const target = event.target as HTMLTextAreaElement;
                    descriptionField.handleChange(target.value);
                }}
                rows={3}
                placeholder="Describe your bundle offer"
                details="Used internally to describe the bundle."
                error={getFieldError("description")}
            />
        </s-stack>
    );
}
