import { NextRequest, NextResponse } from "next/server";
import { handleSessionToken } from "@/lib/shopify";
import { extractBearerToken } from "@/shared";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_UPLOAD_HOSTS = [
    "storage.googleapis.com",
    "storage.shopifycdn.com",
    "shopify-staged-uploads.storage.googleapis.com",
];

const ALLOWED_ORIGINS = [
    "https://admin.shopify.com",
    "https://extensions.shopifycdn.com",
];

function getCorsHeaders(origin: string) {
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
            ? origin
            : "https://admin.shopify.com",
    };
}

function isAllowedUploadUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ALLOWED_UPLOAD_HOSTS.some(
            (host) =>
                parsed.hostname === host ||
                parsed.hostname.endsWith(`.${host}`),
        );
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    const origin = request.headers.get("origin") ?? "";
    const corsHeaders = getCorsHeaders(origin);

    try {
        const authHeader = request.headers.get("authorization");
        const sessionToken = extractBearerToken(authHeader);

        if (!sessionToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders },
            );
        }

        await handleSessionToken(sessionToken);

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const uploadUrl = formData.get("uploadUrl") as string | null;
        const paramsJson = formData.get("params") as string | null;

        if (!file || !uploadUrl) {
            return NextResponse.json(
                { error: "Missing file or uploadUrl" },
                { status: 400, headers: corsHeaders },
            );
        }

        if (!isAllowedUploadUrl(uploadUrl)) {
            return NextResponse.json(
                { error: "Invalid upload destination" },
                { status: 400, headers: corsHeaders },
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 20MB." },
                { status: 413, headers: corsHeaders },
            );
        }

        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);

        const isPutMethod =
            uploadUrl.includes("X-Goog-Algorithm") &&
            uploadUrl.includes("X-Goog-Signature");

        let response: Response;

        if (isPutMethod) {
            response = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
                body: fileBuffer,
            });
        } else {
            let params: Array<{ name: string; value: string }> = [];
            if (paramsJson) {
                try {
                    const parsed = JSON.parse(paramsJson);
                    if (!Array.isArray(parsed)) {
                        return NextResponse.json(
                            { error: "Invalid params format" },
                            { status: 400, headers: corsHeaders },
                        );
                    }
                    params = parsed;
                } catch {
                    return NextResponse.json(
                        { error: "Invalid params JSON" },
                        { status: 400, headers: corsHeaders },
                    );
                }
            }

            const shopifyFormData = new FormData();
            params.forEach((param) => {
                shopifyFormData.append(param.name, param.value);
            });

            const blob = new Blob([fileBuffer], { type: file.type });
            shopifyFormData.append("file", blob, file.name);

            response = await fetch(uploadUrl, {
                method: "POST",
                body: shopifyFormData,
            });
        }

        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch {
                errorText = "Could not read error response";
            }

            console.error("[Upload] Failed:", response.status);

            return NextResponse.json(
                { error: `Upload failed: ${response.status}` },
                { status: 502, headers: corsHeaders },
            );
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("[Upload] Error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500, headers: corsHeaders },
        );
    }
}
