/**
 * Pricing card types
 */
export interface PricingCardItemInfo {
    id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
    primaryButton: {
        content: string;
        loading?: boolean;
        props: {
            variant: "primary" | "secondary";
            external?: boolean;
        };
    };
    featuredText?: string;
}

/**
 * Pricing faqs types
 */
export interface PricingFaqItemInfo {
    id: string;
    title: string;
    description: string;
}
