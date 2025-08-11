import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/get-products";
import { verifyRequest } from "@/lib/shopify/verify";

export async function GET(req: Request) {
    const session = await verifyRequest(req, true);
    if (!session) {
        return NextResponse.json<ApiResponse<null>>(
            {
                status: "error",
                message: "Invalid session",
            },
            { status: 401 },
        );
    }

    try {
        const products = await getProducts(session.shop); // uses stored session from DB
        return NextResponse.json<ApiResponse<typeof products>>({
            status: "success",
            data: products,
        });
    } catch (err: any) {
        return NextResponse.json<ApiResponse<null>>(
            {
                status: "error",
                message: err.message ?? "Something went wrong",
            },
            { status: 500 },
        );
    }
}
