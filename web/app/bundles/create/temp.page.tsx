// app/bundles/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import BundleForm from "@/bundles/_components/BundleForm";

export default function CreateBundlePage() {
    const router = useRouter();

    const handleSuccess = (data: any) => {
        // Redirect to bundle detail page after successful creation
        router.push(`/bundles/${data.id}`);
    };

    const handleCancel = () => {
        // Go back to bundles list
        router.push('/bundles');
    };

    return (
        <BundleForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}