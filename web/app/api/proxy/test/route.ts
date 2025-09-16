// web/app/api/proxy/test/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: "Proxy is working!",
        timestamp: new Date().toISOString(),
        url: request.url,
        headers: Object.fromEntries(request.headers.entries())
    });
}