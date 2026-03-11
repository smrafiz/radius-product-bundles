import { headers } from "next/headers";
import { addHandlers } from "@/lib/shopify";
import shopify from "@/lib/shopify/config/initialize-context";
import prisma from "@/shared/repositories/prisma-connect";

export async function POST(req: Request) {
    const headerList = await headers();
    const topic = headerList.get("x-shopify-topic") || "unknown";
    const shop = headerList.get("x-shopify-shop-domain") || "unknown";
    const webhookId = headerList.get("x-shopify-webhook-id");

    // Idempotency: skip if this delivery was already processed.
    // Safe before HMAC — only matches IDs previously stored after successful HMAC verification.
    if (webhookId) {
        const existing = await prisma.webhookDelivery.findUnique({
            where: { id: webhookId },
        });
        if (existing) {
            return new Response(null, { status: 200 });
        }
    }

    const rawBody = await req.text();

    // Re-add handlers if none are found (likely cold start on serverless)
    const handlers = shopify.webhooks.getHandlers(topic);
    if (!handlers || handlers.length === 0) {
        console.warn(
            `[Webhook] No handlers found for topic: ${topic}, re-adding handlers.`,
        );
        addHandlers();
    }

    try {
        // HMAC validation happens inside shopify.webhooks.process() —
        // verifies X-Shopify-Hmac-Sha256 using apiSecretKey before invoking handlers.
        const { statusCode } = await shopify.webhooks.process({
            rawBody,
            rawRequest: req,
        });

        // Record delivery ID only after HMAC-verified processing succeeds
        if (webhookId) {
            await prisma.webhookDelivery
                .create({
                    data: { id: webhookId, topic, shop },
                })
                .catch(() => {});

            // Prune entries older than 7 days
            prisma.webhookDelivery
                .deleteMany({
                    where: {
                        processedAt: {
                            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                })
                .catch(() => {});
        }

        return new Response(null, { status: statusCode });
    } catch (err) {
        console.error(
            `[Webhook] Processing failed for ${topic} from ${shop}:`,
            err,
        );
        return new Response("Webhook processing failed", { status: 500 });
    }
}
