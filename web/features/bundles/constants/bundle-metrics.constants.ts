/*
 * Bundle metrics constants
 */

import { formatCurrency, MetricCardProps } from "@/shared";

/**
 * Bundle listing metrics
 */
export const BUNDLE_LISTING_METRICS = (metrics: any): MetricCardProps[] => [
    {
        title: "Active Bundles",
        value: (metrics?.activeBundles ?? "").toString(),
        comparisonLabel: "Total created",
        img: {
            svg: METRIC_CARD_SVG["activeBundles"],
        },
    },
    {
        title: "Total Bundles",
        value: (metrics?.totalBundles ?? "").toString(),
        comparisonLabel: "Total created",
        img: {
            url: "/assets/total-bundles.svg",
            alt: "Enable app embed",
        },
    },
    {
        title: "Total Views",
        value:
            metrics?.totalViews !== undefined
                ? metrics.totalViews.toLocaleString()
                : "",
        tone: "info",
        icon: "arrow-down",
        img: {
            url: "/assets/total-views.svg",
            alt: "Enable app embed",
        },
    },
    {
        title: "Total Revenue",
        value:
            metrics?.revenueAllTime !== undefined
                ? formatCurrency(metrics.revenueAllTime)
                : "",
        tone: "info",
        icon: "arrow-down",
        img: {
            url: "/assets/total-revenue.svg",
            alt: "Enable app embed",
        },
    },
];

/*
 * Metric card SVGs
 */
const METRIC_CARD_SVG = {
    activeBundles:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#f1f1f1" height="44" rx="22" width="44"/><path d="m33.4627 23.3996-2.3861-4.1644c-.0815-.1423-.2081-.2449-.3528-.2983-.0006-.0003-.001-.0006-.0016-.0008l-8.4156-3.0842c-.1492-.0546-.3128-.0551-.4623-.0013l-8.563 3.0842c-.0003.0001-.0004.0003-.0006.0004-.1466.053-.275.1563-.3574.2999l-2.3861 4.1645c-.098.1712-.1165.3765-.0507.5624.0658.1858.2093.3338.3931.4052l1.9542.7585v5.1764c0 .2854.179.5401.4475.6368l8.4979 3.0607c.0866.0404.1829.0635.2848.0635.0015 0 .003-.0002.0045-.0002.0017 0 .0034.0002.0051.0002.0777 0 .1553-.0133.2294-.04l8.563-3.0842c.2685-.0967.4475-.3514.4475-.6368v-5.2336l1.8068-.7013c.1838-.0714.3274-.2194.3931-.4052.0659-.1859.0473-.3912-.0507-.5624zm-11.391-6.1919 6.4538 2.3652-6.4633 2.3776-6.5594-2.3769zm-8.2566 3.1943 7.2567 2.6296-1.82 3.1333-7.1487-2.775zm.3724 5.2493 5.1139 1.9851c.0801.031.1629.0459.2447.0459.2353 0 .4613-.1231.5855-.337l1.2555-2.1613v7.2355l-7.1996-2.593zm15.7722 4.1752-7.2188 2.6v-7.1257l1.1199 2.0314c.1637.2968.5218.4268.8377.3042l5.2612-2.0424zm-5.1992-3.6664-1.7233-3.1257 7.1491-2.63 1.7105 2.9855z" fill="#1a1a1a"/><rect fill="#2667ff" height="9" rx="4.5" width="9" x="17.4997" y="10.4369"/><rect height="9" rx="4.5" stroke="#2667ff" width="9" x="17.4997" y="10.4369"/><path d="m21.3086 16.7519c-.1624-.0055-.3165-.0736-.43-.19l-1-1c-.0593-.0565-.1061-.1249-.1371-.2007-.031-.0759-.0456-.1574-.0429-.2393 0-.1565.0622-.3066.1728-.4172.1107-.1107.2608-.1728.4172-.1728.1546.0058.3011.0702.41.18l.6.59 2-2c.1059-.1083.2488-.1726.4-.18.1613.0018.3156.0663.43.18.1106.1138.1725.2663.1725.425s-.0619.3111-.1725.425l-2.43 2.41c-.0998.1122-.24.1805-.39.19z" fill="#fff"/></svg>',
    totalBundles: "/assets/total-bundles.svg",
    totalViews: "/assets/total-views.svg",
    totalRevenue: "/assets/total-revenue.svg",
};
