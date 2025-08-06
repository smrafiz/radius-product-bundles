"use server";

import prisma from "@/lib/db/prisma-connect";
import { handleSessionToken } from "@/lib/shopify/verify";

export interface ProductNoteInput {
    productId: string;
    note: string;
}

export async function createMultipleNotes(
    sessionIdToken: string,
    notes: ProductNoteInput[],
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionIdToken);

        // Prepare the data array
        const data = notes.map((n) => ({
            shop,
            productId: n.productId,
            note: n.note,
        }));

        // Use upsert to avoid duplicate based on @@unique constraint
        const operations = data.map((item) =>
            prisma.productNote.upsert({
                where: {
                    shop_productId: {
                        shop: item.shop,
                        productId: item.productId,
                    },
                },
                update: {
                    note: item.note,
                },
                create: item,
            }),
        );

        await Promise.all(operations);

        return {
            status: "success",
        };
    } catch (error) {
        console.error("Failed to save notes", error);
        return {
            status: "error",
            message: "Failed to save notes.",
        };
    }
}

export async function deleteProductNote(
    productId: string,
    sessionIdToken: string,
) {
    try {
        const { session: { shop }} = await handleSessionToken(sessionIdToken);

        await prisma.productNote.deleteMany({
            where: {
                shop,
                productId,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete product note:", error);
        return { success: false, error: String(error) };
    }
}

export async function getProductNotes(sessionIdToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionIdToken);

        return await prisma.productNote.findMany({
            where: { shop },
            orderBy: {
                createdAt: "asc",
            },
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        return [];
    }
}
