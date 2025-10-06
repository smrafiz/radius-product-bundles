import { headers } from "next/headers";
import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";

export async function POST(req: Request) {
    const headerList = await headers();
    const topic = headerList.get("x-shopify-topic") || "unknown";
    const shop = headerList.get("x-shopify-shop-domain") || "unknown";

    const rawBody = await req.text();

    // Re-add handlers if none are found (likely cold start on serverless)
    const handlers = shopify.webhooks.getHandlers(topic);
    if (!handlers || handlers.length === 0) {
        console.warn(
            `⚠️ No handlers found for topic: ${topic}, re-adding handlers.`,
        );
        addHandlers();
    }

    try {
        const { statusCode } = await shopify.webhooks.process({
            rawBody,
            rawRequest: req,
        });

        return new Response(null, { status: statusCode });
    } catch (err) {
        console.error(
            `❌ Webhook processing failed for ${topic} from ${shop}:`,
            err,
        );
        return new Response("Webhook processing failed", { status: 500 });
    }
}
