"use client";

import { useState } from "react";
import { DashboardSetupSteps } from "./dashboard-setup-steps";
import { useDashboardStore } from "@/features/dashboard";

interface SetupButtonProps {
    content: string;
    props?: Record<string, any>;
}

export interface SetupItem {
    id: number;
    title: string;
    description?: string;
    image?: {
        url: string;
        alt?: string;
    };
    complete: boolean;
    primaryButton?: SetupButtonProps;
    secondaryButton?: SetupButtonProps;
}

export function DashboardSetUpGuide() {
    const { loading } = useDashboardStore();
    const [showGuide, setShowGuide] = useState(true);
    const [items, setItems] = useState<SetupItem[]>(ITEMS);

    if (loading) {
        return (
            <s-section padding="base">
                <div className="p-4">
                    <s-stack gap="base">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-2 bg-[#f4f4f4] rounded overflow-hidden relative"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-[#f4f4f4] via-[#f8f8f8] to-[#f4f4f4] animate-shimmer"
                                    style={{
                                        width: `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`,
                                        animationDuration: `${1 + Math.random() * 1.5}s`,
                                    }}
                                />
                            </div>
                        ))}
                    </s-stack>
                </div>
            </s-section>
        );
    }

    // Example of step complete handler, adjust for your use case
    const onStepComplete = async (id: number): Promise<void> => {
        try {
            // Simulate API call
            await new Promise<void>((res) => setTimeout(res, 1000));

            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, complete: !item.complete }
                        : item,
                ),
            );
        } catch (e) {
            console.error(e);
        }
    };

    if (!showGuide)
        return (
            <s-button onClick={() => setShowGuide(true)}>
                Show Setup Guide
            </s-button>
        );

    return (
        <DashboardSetupSteps
            items={items as any}
            onDismiss={() => {
                setShowGuide(false);
                setItems(ITEMS);
            }}
            onStepComplete={onStepComplete}
        />
    );
}

const ITEMS: SetupItem[] = [
    {
        id: 0,
        title: "Enable app embed",
        description:
            "For your bundles to appear on your storefront, enable Bundles app embed and click Save on your theme.",
        image: {
            url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
            alt: "Illustration highlighting ShopPay integration",
        },
        complete: true,
        primaryButton: {
            content: "Enable in theme editor",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
    {
        id: 1,
        title: "Create your first bundle campaign",
        description:
            "Pick a bundle type, customize it to fit your products and brand, and preview it live on your store.",
        image: {
            url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
            alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
        },
        complete: false,
        primaryButton: {
            content: "Create a bundle campaign",
            props: {
                onAction: () => console.log("copied store link!"),
            },
        },
        secondaryButton: {
            content: "Learn more",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
    {
        id: 2,
        title: "Start tracking your bundle campaign performance",
        description:
            "You're all set! Click Finish setup and start monitoring how your bundles are performing.",
        image: {
            url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
        },
        complete: false,
        primaryButton: {
            content: "Finish setup",
            props: {
                url: "https://www.example.com",
                external: true,
            },
        },
    },
];
