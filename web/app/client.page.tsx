"use client";

import { graphql } from "@/lib/gql";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
    Button,
    Frame,
    LegacyCard as Card,
    Modal,
    Page,
    Select,
    Text,
    Toast,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import {
    createMultipleNotes,
    getProductNotes,
    ProductNoteInput,
} from "@/actions/notes.action";
import ProductNoteRepeater from "@/components/ProductNote";
import { NoteAddIcon, ViewIcon, SearchIcon } from "@shopify/polaris-icons";
import { useGraphQL } from "@/hooks/useGraphQL";
import { WebhookListCard } from "@/components/WebhookListCard";
import { getProductInfo } from "@/actions/product.action";

interface Data {
    name: string;
    height: string;
}

const GET_SHOP = graphql(`
    query getShop {
        shop {
            name
        }
    }
`);

export default function Home() {
    const [products, setProducts] = useState<
        { label: string; value: string }[]
    >([]);
    type ServerActionResult =
        | {
              status: "success";
              product: { id: string; title: string; tags: string[] };
          }
        | { status: "error"; error?: string };

    const [serverActionResult, setServerActionResult] =
        useState<ServerActionResult>();
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [loadingProductInfo, setLoadingProductInfo] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    const [noteRows, setNoteRows] = useState<ProductNoteInput[]>([
        { productId: "", note: "" },
    ]);
    const [toastActive, setToastActive] = useState(false);
    const [sessionToken, setSessionToken] = useState("");
    const [shopName, setShopName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // useGraphQL is a hook that uses Tanstack Query to query Shopify GraphQL, everything is typed!
    const {
        data: graphqlData,
        isLoading: graphqlLoading,
        error: graphqlError,
    } = useGraphQL(GET_SHOP);

    const app = useAppBridge();

    useEffect(() => {
        async function fetchProducts() {
            const token = await app.idToken();
            setLoadingProducts(true);
            const res = await fetch("/api/products?token=" + token);
            const { data } = await res.json();

            const items = data.map((p: any) => ({
                label: p.title,
                value: p.id,
            }));

            setProducts(items);
            if (items.length) {
                setSelectedProduct(items[0].value);
                setLoadingProducts(false);
            }
        }

        const fetchNotes = async () => {
            const token = await app.idToken();
            const notes = await getProductNotes(token);

            if (notes.length > 0) {
                const rows = notes.map((note) => ({
                    productId: note.productId,
                    note: note.note,
                }));
                setNoteRows(rows);
            }
        };

        void fetchProducts();
        void fetchNotes();

        app.idToken().then(setSessionToken);
    }, [app]);

    const handleAddProductNote = async () => {
        setLoadingNotes(true);
        const token = await app.idToken();

        const validNotes = noteRows.filter(
            (row) => row.productId && row.note.trim(),
        );
        if (validNotes.length === 0) {
            alert("Please fill out at least one valid product and note.");
            setLoadingNotes(false);
            return;
        }

        const result = await createMultipleNotes(token, validNotes);

        setLoadingNotes(false);

        if (result.status === "success") {
            setToastActive(true);
        } else {
            console.error("Failed to save notes");
        }
    };

    const handleGQLQuery = async () => {
        setError(null);
        try {
            const res = await fetch("shopify:admin/api/graphql.json", {
                method: "POST",
                body: JSON.stringify({
                    query: `
            query {
              shop {
                name
              }
            }
          `,
                }),
            });

            const { data, errors } = await res.json();

            if (errors) {
                setError("GraphQL error occurred");
                console.error(errors);
                return;
            }

            setShopName(data?.shop?.name ?? "Unknown");
        } catch (err) {
            console.error(err);
            setError("Fetch failed");
        }
    };

    return (
        <Frame>
            <Page>
                <Card
                    sectioned
                    title="Add custom note to Postgres"
                    primaryFooterAction={{
                        content: loadingNotes ? "Saving..." : "Save Notes",
                        onAction: handleAddProductNote,
                        disabled: loadingNotes,
                        icon: NoteAddIcon,
                    }}
                >
                    <ProductNoteRepeater
                        products={products}
                        value={noteRows}
                        onChange={setNoteRows}
                        sessionToken={sessionToken}
                        productsLoading={loadingProducts}
                    />
                </Card>

                <Card
                    sectioned
                    title="Get product details using server actions"
                    primaryFooterAction={{
                        content: loadingProductInfo
                            ? "Loading..."
                            : "View Product",
                        onAction: async () => {
                            if (!selectedProduct || loadingProductInfo) return;
                            setLoadingProductInfo(true);
                            const token = await app.idToken();
                            const result = await getProductInfo(
                                token,
                                selectedProduct,
                            );
                            setServerActionResult(result);
                            setLoadingProductInfo(false);

                            if (result.status === "success") {
                                setModalOpen(true);
                            }
                        },
                        disabled: loadingProductInfo,
                        icon: ViewIcon,
                    }}
                >
                    <Text as="p" variant="bodyMd">
                        Retrieve detailed product information securely via a
                        server action using session token verification.
                    </Text>

                    <Select
                        label="Select a product"
                        options={
                            loadingProducts
                                ? [{ label: "Loading products...", value: "" }]
                                : products
                        }
                        value={loadingProducts ? "Select a product" : selectedProduct}
                        onChange={setSelectedProduct}
                        disabled={loadingProducts}
                    />

                    {serverActionResult?.status === "success" && (
                        <Modal
                            open={modalOpen}
                            onClose={handleCloseModal}
                            title="Product Details"
                            primaryAction={{
                                content: "Close",
                                onAction: handleCloseModal,
                            }}
                        >
                            <Modal.Section>
                                {serverActionResult?.status === "success" &&
                                    serverActionResult.product && (
                                        <>
                                            <Text as="p">
                                                <strong>ID:</strong>{" "}
                                                {serverActionResult.product.id}
                                            </Text>
                                            <Text as="p">
                                                <strong>Title:</strong>{" "}
                                                {
                                                    serverActionResult.product
                                                        .title
                                                }
                                            </Text>
                                            <Text as="p">
                                                <strong>Tags:</strong>{" "}
                                                {serverActionResult.product.tags.join(
                                                    ", ",
                                                ) || "None"}
                                            </Text>
                                        </>
                                    )}
                            </Modal.Section>
                        </Modal>
                    )}
                    {serverActionResult?.status === "error" && (
                        <Text as="h1" variant="headingSm" tone="critical">
                            Server action failed.
                        </Text>
                    )}
                </Card>

                <Card
                    sectioned
                    title="Use Tanstack Query to query Shopify GraphQL"
                >
                    <Text as="p" variant="bodyMd">
                        Use Tanstack Query to query Shopify&apos;s GraphQL API
                        directly from the client.
                    </Text>
                    {graphqlLoading && <p>Loading...</p>}
                    {graphqlData && <p>{graphqlData.shop.name}</p>}
                    {graphqlError && <p>{graphqlError.message}</p>}
                </Card>

                <Card
                    sectioned
                    title="Shopify App Bridge"
                    primaryFooterAction={{
                        content: "GraphQL Query",
                        onAction: handleGQLQuery,
                        icon: SearchIcon,
                    }}
                >
                    <Text as="p" variant="bodyMd">
                        Use the direct graphql api provided by Shopify App
                        Bridge. This automatically uses an authenticated graphql
                        route, no need to add tokens.
                    </Text>
                    {shopName && (
                        <Text as="p" variant="bodyMd" tone="success">
                            ✅ Shop name: <strong>{shopName}</strong>
                        </Text>
                    )}
                    {error && (
                        <Text as="p" variant="bodyMd" tone="critical">
                            ⚠️ {error}
                        </Text>
                    )}
                </Card>
                <WebhookListCard />

                {/* toast notification */}
                {toastActive && (
                    <Toast
                        content="Notes saved successfully"
                        onDismiss={() => setToastActive(false)}
                    />
                )}
                <div className="h-[100px]" />
            </Page>
        </Frame>
    );
}
