"use server";

/**
 * Product Creation Actions - Auth Layer
 * Handles Shopify product creation via GraphQL
 */

import {
    CreateBundleProductInput,
    formatProductForStorage,
    transformBundleToProductVariables,
    validateProductInput,
} from "@/features/bundles";
import { ApiResponse } from "@/shared";
import {
    GetProductByIdDocument,
    GetProductByIdQuery,
    ProductCreateDocument,
    ProductCreateMutation,
    ProductCreateMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGraphQLMutation, executeGraphQLQuery } from "@/lib";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Create a Shopify product for a bundle
 */
export async function createBundleProductAction(
    sessionToken: string,
    input: CreateBundleProductInput,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Transform bundle data to GraphQL variables
        const variables = transformBundleToProductVariables(
            input.bundleName,
            input.bundleDescription,
            input.bundleType,
        );

        // Validate input
        const validation = validateProductInput(variables);
        if (!validation.valid) {
            return {
                status: "error",
                message: validation.errors.join(", "),
                data: null,
            };
        }

        // Execute GraphQL mutation using codegen document
        const result = await executeGraphQLMutation<ProductCreateMutation>({
            query: ProductCreateDocument,
            variables: variables as ProductCreateMutationVariables,
            sessionToken,
        });

        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
            return {
                status: "error",
                message: result.errors.map((e) => e.message).join(", "),
                data: null,
            };
        }

        // Check for user errors from Shopify
        if (
            result.data?.productCreate?.userErrors &&
            result.data.productCreate.userErrors.length > 0
        ) {
            return {
                status: "error",
                message: result.data.productCreate.userErrors
                    .map((e) => e.message)
                    .join(", "),
                data: null,
            };
        }

        // Check if product was created
        if (!result.data?.productCreate?.product) {
            return {
                status: "error",
                message: "Failed to create product - no product returned",
                data: null,
            };
        }

        // Format product data for database storage
        const productData = formatProductForStorage(
            result.data.productCreate.product,
        );

        console.log("Product created successfully:", productData);

        return {
            status: "success",
            message: "Product created successfully",
            data: productData,
        };
    } catch (error) {
        console.error("[createBundleProduct] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create product",
            data: null,
        };
    }
}

/**
 * Fetch product data for bundle edit mode
 */
export async function fetchProductById(
    sessionToken: string,
    productId: string,
) {
    const result = await executeGraphQLQuery<GetProductByIdQuery>({
        query: GetProductByIdDocument,
        variables: { id: productId },
        sessionToken,
    });

    if (!result.data?.product) {
        return null;
    }

    const product = result.data.product;

    return {
        id: product.id,
        title: product.title,
        descriptionHtml: product.descriptionHtml || "",
        handle: product.handle,
        // images:
        //     product.images?.edges?.map((edge) => ({
        //         id: edge.node.id,
        //         url: edge.node.url,
        //         altText: edge.node.altText || "",
        //     })) || [],
        // featuredImage: product.featuredImage
        //     ? {
        //         id: product.featuredImage.id,
        //         url: product.featuredImage.url,
        //         altText: product.featuredImage.altText || "",
        //     }
        //     : null,
    };
}
