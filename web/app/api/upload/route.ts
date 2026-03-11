import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy file uploads to Shopify's staged URLs
 */
export async function POST(request: NextRequest) {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigins = [
        "https://admin.shopify.com",
        "https://extensions.shopifycdn.com",
    ];
    const corsHeaders = {
        "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
            ? origin
            : "https://admin.shopify.com",
    };

    try {
        const formData = await request.formData();

        const file = formData.get("file") as File | null;
        const uploadUrl = formData.get("uploadUrl") as string | null;
        const paramsJson = formData.get("params") as string | null;

        console.log("[Upload API] File:", file?.name, "Size:", file?.size);

        if (!file || !uploadUrl) {
            return NextResponse.json(
                { error: "Missing file or uploadUrl" },
                { status: 400, headers: corsHeaders },
            );
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 413, headers: corsHeaders },
            );
        }

        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);

        // Check if the URL has signed parameters (PUT method for images)
        const isPutMethod =
            uploadUrl.includes("X-Goog-Algorithm") &&
            uploadUrl.includes("X-Goog-Signature");

        let response: Response;

        if (isPutMethod) {
            console.log("[Upload API] Using PUT method (signed URL)...");

            response = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
                body: fileBuffer,
            });
        } else {
            console.log("[Upload API] Using POST method with FormData...");

            let params: Array<{ name: string; value: string }> = [];
            if (paramsJson) {
                try {
                    const parsed = JSON.parse(paramsJson);
                    if (!Array.isArray(parsed)) {
                        return NextResponse.json(
                            { error: "Invalid params format: expected array" },
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

        console.log("[Upload API] Response status:", response.status);

        if (!response.ok) {
            let errorText;

            try {
                errorText = await response.text();
            } catch {
                errorText = "Could not read error response";
            }

            console.error(
                "[Upload API] Error:",
                response.status,
                errorText.substring(0, 500),
            );

            return NextResponse.json(
                {
                    error: `Upload failed: ${response.status}`,
                    details: errorText.substring(0, 200),
                },
                { status: 502, headers: corsHeaders },
            );
        }

        console.log("[Upload API] ✅ Success");
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("[Upload API] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500, headers: corsHeaders },
        );
    }
}
