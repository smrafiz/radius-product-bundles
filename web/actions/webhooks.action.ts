'use server';

import { loadSession } from "@/lib/db/session-storage";
import shopify from "@/lib/shopify/initialize-context";
import { handleSessionToken } from "@/lib/shopify/verify";

export type ServerActionResult = {
    status: "success" | "error";
    error?: string;
    data?: {
        webhookSubscriptions: {
            edges: {
                node: {
                    id: string;
                    topic: string;
                    endpoint: {
                        callbackUrl: string;
                    };
                };
            }[];
        };
    };
};

// Type for the GraphQL response
type GraphQLResponse = {
    body: {
        data?: {
            webhookSubscriptions: {
                edges: {
                    node: {
                        id: string;
                        topic: string;
                        endpoint: {
                            __typename?: string;
                            callbackUrl: string;
                        };
                    };
                }[];
            };
        };
        errors?: Array<{ message: string }>;
    };
};

export async function fetchRegisteredWebhooks(token: string): Promise<ServerActionResult> {
    try {
        const { session } = await handleSessionToken(token);

        if (!session) {
            return {
                status: "error",
                error: "Invalid session or token"
            } as const;
        }

        const client = new shopify.clients.Graphql({
            session,
        });

        const query = `
        {
          webhookSubscriptions(first: 10) {
            edges {
              node {
                id
                topic
                endpoint {
                  __typename
                  ... on WebhookHttpEndpoint {
                    callbackUrl
                  }
                }
              }
            }
          }
        }
        `;

        const response = await client.query({ data: query }) as GraphQLResponse;

        // Check for GraphQL errors
        if (response.body.errors && response.body.errors.length > 0) {
            return {
                status: "error",
                error: response.body.errors[0].message
            } as const;
        }

        // Check if the response contains the expected structure
        if (response.body?.data?.webhookSubscriptions) {
            return {
                status: "success",
                data: response.body.data
            } as const;
        } else {
            return {
                status: "error",
                error: "Invalid response structure from Shopify API"
            } as const;
        }

    } catch (error) {
        console.error("Error fetching webhooks:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred"
        } as const;
    }
}