// web/app/api/proxy_route/[[...proxyPath]]/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ proxyPath?: string[] }> },
) {
    const { proxyPath } = await params; // Await params
    const pathSegments = proxyPath || [];
    const fullPath = pathSegments.join("/");

    console.log("✅ Proxy route called!", pathSegments);

    // Handle base path (empty array)
    if (pathSegments.length === 0) {
        return new Response(
            `
            <div style="border: 2px solid blue; padding: 20px;">
                <h1>✅ BASE PATH WORKS!</h1>
                <p>/apps/radius-bundles-proxy/</p>
            </div>
        `,
            {
                status: 200,
                headers: { "Content-Type": "application/liquid" },
            },
        );
    }

    // Handle sub-paths
    return new Response(
        `
        <div style="border: 2px solid green; padding: 20px;">
            <h1>✅ SUB PATH WORKS!</h1>
            <p>Path: /${fullPath}</p>
        </div>
    `,
        {
            status: 200,
            headers: { "Content-Type": "application/liquid" },
        },
    );
}
