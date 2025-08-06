import { verifyRequest } from "@/lib/shopify/verify";
import { getProducts } from "@/lib/get-products";
import { NextResponse } from "next/server";

export type APIResponse<DataType> = {
    status: "success" | "error";
    data?: DataType;
    message?: string;
};

export async function GET(req: Request) {
    const session = await verifyRequest(req, true);
    if (!session) {
        return NextResponse.json<APIResponse<null>>(
            {
                status: "error",
                message: "Invalid session",
            },
            { status: 401 },
        );
    }

    try {
        const products = await getProducts(session.shop); // uses stored session from DB
        return NextResponse.json<APIResponse<typeof products>>({
            status: "success",
            data: products,
        });
    } catch (err: any) {
        return NextResponse.json<APIResponse<null>>(
            {
                status: "error",
                message: err.message ?? "Something went wrong",
            },
            { status: 500 },
        );
    }
}
