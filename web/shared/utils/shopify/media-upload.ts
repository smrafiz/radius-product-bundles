"use client";

/**
 * Upload a single file via the API route
 */
export async function uploadFileToStagedUrl(
    file: File,
    stagedTarget: {
        url: string;
        resourceUrl: string;
        parameters: Array<{ name: string; value: string }>;
    },
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadUrl", stagedTarget.url);

    if (stagedTarget.parameters && stagedTarget.parameters.length > 0) {
        formData.append("params", JSON.stringify(stagedTarget.parameters));
    }

    console.log(
        `[Upload] ${file.name} to ${stagedTarget.url.substring(0, 60)}...`,
    );
    console.log(`[Upload] Params:`, stagedTarget.parameters);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Upload] Failed:`, errorData);
        throw new Error(
            errorData.error || `Failed to upload file: ${response.status}`,
        );
    }

    console.log(`[Upload] ✅ Success: ${file.name}`);
    return stagedTarget.resourceUrl;
}

/**
 * Upload multiple files to Shopify via the API route
 */
export async function uploadFilesToShopify(
    files: File[],
    stagedTargets: Array<{
        url: string;
        resourceUrl: string;
        parameters: Array<{ name: string; value: string }>;
    }>,
): Promise<string[]> {
    const resourceUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stagedTarget = stagedTargets[i];

        try {
            console.log(`Uploading ${i + 1}/${files.length}: ${file.name}...`);
            const resourceUrl = await uploadFileToStagedUrl(file, stagedTarget);
            resourceUrls.push(resourceUrl);
            console.log(`✅ Uploaded: ${file.name}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${file.name}:`, error);
        }
    }

    return resourceUrls;
}

/**
 * Extract base URL path for comparison (removes query params)
 */
export const getImageBasePath = (url: string): string => {
    try {
        const u = new URL(url);
        return u.pathname;
    } catch {
        return url;
    }
};
