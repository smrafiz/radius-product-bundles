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
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>Bundle details</s-heading>
                <s-tooltip id="bundle-details-tooltip">
                    <s-text>
                        Name and describe your bundle. These fields are used
                        internally to identify this bundle in your admin.
                    </s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bundle-details-tooltip"
                />
            </s-stack>
            <s-stack>
                <s-text-field
                    label="Bundle name"
                    value={nameField.value || ""}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        nameField.handleChange(target.value);
                    }}
                    onBlur={nameField.handleBlur}
                    placeholder={
                        isGeneratingName
                            ? "Generating unique name..."
                            : "Enter bundle name"
                    }
                    details="Unique identifier for your bundle."
                    error={getFieldError("name")}
                    disabled={isGeneratingName}
                    maxLength={100}
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
                onBlur={descriptionField.handleBlur}
                rows={3}
                placeholder="Describe your bundle offer"
                details="Used internally to describe the bundle."
                error={getFieldError("description")}
                maxLength={300}
            />
        </s-stack>
    );
}
