// app/bundles/create/[bundleType]/page.tsx
"use client";

import { use } from "react";
import {
    BundleCreationForm,
    BundleFormProvider,
} from "@/bundles/create/[bundleType]/_components/form";
import { useBundleStore } from "@/stores";
import { createBundle } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { BundleType } from "@/types";
import { BundleFormData } from "@/lib/validation";
import { GlobalForm } from "@/components";

export default function CreateBundlePage({
    params,
}: {
    params: Promise<{ bundleType: BundleType }>;
}) {
    const { bundleType } = use(params);
    const app = useAppBridge();
    const { resetDirty } = useBundleStore();

    const handleSubmit = async (data: BundleFormData) => {
        try {
            const token = await app.idToken();
            const result = await createBundle(token, {
                ...data,
                type: bundleType,
            });

            if (result.status === "success") {
                console.log("Bundle created successfully:", result);
            } else {
                console.error("Validation errors:", result.errors);
            }
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                discardPath="/bundles"
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}
