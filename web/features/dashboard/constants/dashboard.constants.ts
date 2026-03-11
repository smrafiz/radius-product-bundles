import {
    DashboardVideoConfig,
    DashboardMetricConfig,
    DashboardQuickActionItem,
    DashboardCalloutCardsItem,
    SetupStepKey,
} from "@/features/dashboard/types";
import { ACTION_THEMES, ROUTES } from "@/shared/constants";
import { SETUP_STEP_KEYS } from "@/features/dashboard/constants/setup-guide.constants";

export interface SetupGuideStep {
    id: number;
    stepKey: SetupStepKey;
    title: string;
    description: string;
    image?: { url: string; alt: string };
    primaryButton: {
        content: string;
        internalUrl?: string;
    };
    secondaryButton?: {
        content: string;
        internalUrl?: string;
    } | null;
}

/*
 * Metric card SVGs
 */
const DASHBOARD_METRICS_SVG = {
    activeBundles:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#f1f1f1" height="44" rx="22" width="44"/><path d="m33.4627 23.3996-2.3861-4.1644c-.0815-.1423-.2081-.2449-.3528-.2983-.0006-.0003-.001-.0006-.0016-.0008l-8.4156-3.0842c-.1492-.0546-.3128-.0551-.4623-.0013l-8.563 3.0842c-.0003.0001-.0004.0003-.0006.0004-.1466.053-.275.1563-.3574.2999l-2.3861 4.1645c-.098.1712-.1165.3765-.0507.5624.0658.1858.2093.3338.3931.4052l1.9542.7585v5.1764c0 .2854.179.5401.4475.6368l8.4979 3.0607c.0866.0404.1829.0635.2848.0635.0015 0 .003-.0002.0045-.0002.0017 0 .0034.0002.0051.0002.0777 0 .1553-.0133.2294-.04l8.563-3.0842c.2685-.0967.4475-.3514.4475-.6368v-5.2336l1.8068-.7013c.1838-.0714.3274-.2194.3931-.4052.0659-.1859.0473-.3912-.0507-.5624zm-11.391-6.1919 6.4538 2.3652-6.4633 2.3776-6.5594-2.3769zm-8.2566 3.1943 7.2567 2.6296-1.82 3.1333-7.1487-2.775zm.3724 5.2493 5.1139 1.9851c.0801.031.1629.0459.2447.0459.2353 0 .4613-.1231.5855-.337l1.2555-2.1613v7.2355l-7.1996-2.593zm15.7722 4.1752-7.2188 2.6v-7.1257l1.1199 2.0314c.1637.2968.5218.4268.8377.3042l5.2612-2.0424zm-5.1992-3.6664-1.7233-3.1257 7.1491-2.63 1.7105 2.9855z" fill="#1a1a1a"/><rect fill="#2667ff" height="9" rx="4.5" width="9" x="17.4997" y="10.4369"/><rect height="9" rx="4.5" stroke="#2667ff" width="9" x="17.4997" y="10.4369"/><path d="m21.3086 16.7519c-.1624-.0055-.3165-.0736-.43-.19l-1-1c-.0593-.0565-.1061-.1249-.1371-.2007-.031-.0759-.0456-.1574-.0429-.2393 0-.1565.0622-.3066.1728-.4172.1107-.1107.2608-.1728.4172-.1728.1546.0058.3011.0702.41.18l.6.59 2-2c.1059-.1083.2488-.1726.4-.18.1613.0018.3156.0663.43.18.1106.1138.1725.2663.1725.425s-.0619.3111-.1725.425l-2.43 2.41c-.0998.1122-.24.1805-.39.19z" fill="#fff"/></svg>',
    totalRevenue:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><clipPath id="a"><path d="m10.3333 11h23v23h-23z"/></clipPath><rect fill="#f1f1f1" height="44" rx="22" width="44"/><g clip-path="url(#a)"><path d="m25.9133 19.17c-.22 0-.45 0-.67 0v-4.17c0-1.17-.83-2.23-2.35-3-1.5902-.7092-3.3197-1.051-5.06-1-1.7601-.0329-3.5055.3257-5.11 1.05-1.54.76-2.39 1.82-2.39 2.95v12.26c0 1.17.85 2.23 2.39 3 1.6052.7208 3.3506 1.0761 5.11 1.04.747.0013 1.4928-.0589 2.23-.18.7767.9844 1.7906 1.7556 2.9467 2.2414 1.1561.4857 2.4166.6702 3.6634.536s2.4391-.5826 3.4654-1.3033c1.0262-.7206 1.8528-1.6899 2.4023-2.8171s.8039-2.3754.7395-3.6277c-.0644-1.2524-.4456-2.4679-1.1078-3.5327-.6623-1.0649-1.584-1.9443-2.6787-2.5558-1.0948-.6115-2.3269-.9352-3.5808-.9408zm-12.58-5.91c1.4153-.63 2.9509-.944 4.5-.92 3.57 0 6.06 1.42 6.06 2.7s-2.49 2.69-6.06 2.69c-1.5483.0271-3.0839-.2834-4.5-.91-1.06-.52-1.66-1.16-1.66-1.82s.6-1.23 1.66-1.74zm-1.66 4.13c.3329.2314.684.4354 1.05.61 1.6084.7071 3.3536 1.0486 5.11 1 1.7407.0558 3.4713-.2862 5.06-1 .3535-.1681.6887-.3726 1-.61v2c-1.3271.3778-2.522 1.119-3.45 2.14-.8575.1868-1.7325.2807-2.61.28-1.541.0587-3.0763-.2177-4.5-.81-1.06-.56-1.66-1.21-1.66-1.83zm6.16 12.61c-1.555-.0011-3.0909-.3425-4.5-1-1.05-.52-1.65-1.16-1.65-1.78v-1.7c.3295.2453.681.4595 1.05.64 1.5974.74 3.3394 1.1158 5.1 1.1h.7c.078.9156.3291 1.8081.74 2.63-.4772.0671-.9582.1039-1.44.11zm.7-4.06h-.7c-1.551.0226-3.0878-.2984-4.5-.94-1.05-.51-1.65-1.16-1.65-1.77v-1.7c.3295.2453.681.4595 1.05.64 1.6014.7228 3.3432 1.0814 5.1 1.05.5013-.0007 1.0021-.0307 1.5-.09-.4447.8588-.7165 1.7965-.8 2.76zm7.38 6.76c-1.2006 0-2.3742-.356-3.3724-1.023s-1.7762-1.615-2.2356-2.7241c-.4594-1.1092-.5796-2.3296-.3454-3.5071s.8123-2.259 1.6612-3.1079 1.9305-1.4271 3.108-1.6613c1.1774-.2342 2.3979-.114 3.507.3454 1.1092.4595 2.0572 1.2375 2.7242 2.2357s1.023 2.1718 1.023 3.3723c-.0132 1.6012-.6586 3.1323-1.7955 4.2598-1.1369 1.1276-2.6733 1.7602-4.2745 1.7602z" fill="#1a1a1a"/><path d="m27.9433 27.93c.0039.4198-.1244.8301-.3667 1.1729s-.5863.6007-.9833.7371v1.45h-1.35v-1.45c-.397-.1364-.741-.3943-.9833-.7371s-.3706-.7531-.3667-1.1729h1.35c-.002.1353.0364.2682.1104.3815s.18.202.3047.2547.2622.0671.395.0411c.1329-.0259.2549-.0908.3506-.1865s.1607-.2178.1866-.3507c.0259-.1328.0116-.2703-.0411-.395-.0527-.1246-.1414-.2307-.2547-.3047-.1134-.0739-.2462-.1124-.3815-.1104-.5003.0438-.9988-.1023-1.3964-.4091-.3976-.3069-.6652-.7521-.7496-1.2472s.0206-1.0038.294-1.425c.2735-.4213.6954-.7242 1.182-.8487v-1.46h1.35v1.46c.3953.1359.7382.3922.9804.733.2421.3408.3714.7489.3696 1.167h-1.35c0-.1345-.0399-.266-.1146-.3778s-.1809-.199-.3052-.2504c-.1243-.0515-.261-.065-.3929-.0387-.1319.0262-.2531.091-.3482.1861s-.1598.2162-.1861.3481c-.0262.1319-.0127.2687.0387.3929.0515.1243.1387.2305.2505.3052s.2433.1146.3778.1146c.2668-.004.5318.0454.7792.1454.2475.0999.4724.2484.6616.4367.1892.1882.3388.4124.4399.6594.1012.2469.152.5116.1493.7785z" fill="#2667ff"/></g></svg>',
    conversionRate:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#f1f1f1" height="44" rx="22" width="44"/><path d="m23.0159 22.1228v.5024 2.1549.1675-2.3112c.0116-.171.0116-.3426 0-.5136zm-.5471-1.5743c.1531.162.2743.3514.3573.5583-.0717-.2125-.1944-.4041-.3573-.5583z" fill="#1a1a1a"/><path d="m25.7179 14.2403h-2.9252c-2.8695 0-4.1981 1.3398-4.2093 4.1757-2.8471 0-4.1757 1.351-4.1757 4.2092v2.9141c0 2.8806 1.3398 4.2204 4.2092 4.2204h2.9253c2.8582 0 4.198-1.3286 4.2204-4.1757 2.847 0 4.1534-1.3622 4.1645-4.1981v-2.9252c0-2.8806-1.3398-4.2204-4.2092-4.2204zm-1.5631 11.3102c0 1.9985-.6141 2.6126-2.6126 2.6126h-2.9253c-1.9985 0-2.6014-.6141-2.6014-2.6126v-2.9141c0-2.0097.6029-2.6126 2.6014-2.6126h2.9253c.3975-.0088.7946.0286 1.1835.1116.3234.0565.6227.2081.8597.4355.1629.1541.2855.3458.3573.5582.0326.0796.0588.1618.0781.2457.0175.0959.0287.1929.0335.2902 0 .1452 0 .3015.0558.469.0117.171.0117.3426 0 .5136zm4.1757-4.1646c0 1.9874-.6029 2.5903-2.5679 2.6015v-1.351c0-2.8806-1.351-4.2204-4.2204-4.2204h-1.3622c0-1.965.6253-2.5679 2.6127-2.5679h2.9252c1.9985 0 2.6126.614 2.6126 2.6126z" fill="#1a1a1a"/><g fill="#2667ff"><path d="m33.6786 25.2044c-.0089 2.1993-.8872 4.3059-2.4435 5.86-1.5562 1.5542-3.664 2.4297-5.8633 2.4356-.1415-.0015-.2801-.0403-.4018-.1125-.1216-.0722-.2221-.1753-.2912-.2988-.0691-.1234-.1044-.2629-.1023-.4044s.0415-.2799.1142-.4013l1.1165-1.8757c.0543-.0909.1259-.1703.2108-.2335s.1814-.1091.2841-.135c.1026-.0259.2094-.0314.3141-.016.1048.0153.2055.0511.2964.1054.0909.0542.1702.1258.2334.2107s.1091.1815.135.2841c.026.1027.0314.2094.0161.3141-.0153.1048-.0512.2055-.1054.2964l-.2903.4801c1.4687-.3445 2.7782-1.1746 3.7164-2.3559.9381-1.1813 1.4501-2.6448 1.453-4.1533 0-.2132.0847-.4177.2355-.5685.1507-.1507.3552-.2354.5684-.2354s.4177.0847.5684.2354c.1508.1508.2355.3553.2355.5685z"/><path d="m19.5883 11.717-1.1165 1.8757c-.1288.1378-.3019.2259-.4891.2489s-.3765-.0205-.5349-.1229c-.1583-.1025-.2756-.2574-.3313-.4375-.0557-.1802-.0463-.3743.0266-.5482l.2903-.4801c-1.4743.3458-2.7879 1.1808-3.7267 2.369s-1.4474 2.6594-1.4427 4.1737c0 .2132-.0847.4177-.2354.5685-.1508.1507-.3553.2354-.5685.2354s-.4176-.0847-.5684-.2354c-.1508-.1508-.2354-.3553-.2355-.5685.003-2.1992.878-4.3075 2.433-5.8626 1.5551-1.5551 3.6634-2.43 5.8627-2.433.1407-.0004.2789.0365.4006.1072.1216.0706.2223.1724.2916.2947.0656.1282.095.2717.0852.4153-.0099.1436-.0586.2818-.141.3998z"/></g></svg>',
    totalViews:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#f1f1f1" height="44" rx="22" width="44"/><path d="m22.0161 29.43c-6.09 0-10.9-6.21-11.43-6.86-.1236-.1594-.1842-.3588-.17-.56-.0036-.1829.0525-.3619.16-.51.21-.28 5.09-6.93 11.44-6.93s11.4 6.86 11.4 6.93c.1123.1461.1722.3257.17.51-.0015.1806-.0611.356-.17.5 0 .06-5 6.92-11.4 6.92zm-9.6-7.43c1.19 1.43 5.14 5.72 9.65 5.72s8.46-4.29 9.64-5.72c-1.23-1.43-5.18-5.71-9.69-5.71s-8.46 4.28-9.6 5.71z" fill="#1a1a1a"/><path d="m22.0161 25.84c-.2515-.0035-.5023-.0269-.75-.07-.7585-.1432-1.4557-.5127-2-1.06-.5499-.5409-.9171-1.2402-1.05-2-.141-.7424-.0574-1.51.2401-2.2047.2974-.6947.7953-1.285 1.4299-1.6953.6281-.4268 1.3706-.6534 2.13-.65.505-.0026 1.0055.0949 1.4726.2869s.8915.4748 1.2486.8319.6398.7815.8319 1.2486c.192.4671.2895.9676.2869 1.4726.0034.7594-.2232 1.5019-.65 2.13-.412.6451-1.0125 1.1479-1.72 1.44-.4666.191-.9659.2895-1.47.29zm0-6.2c-.1564-.0144-.3137-.0144-.47 0-.4628.0951-.8872.3247-1.22.66-.3368.3338-.5663.7605-.6589 1.2255-.0927.4651-.0443.9472.1389 1.3845.1763.4438.4805.8252.874 1.0959.3935.2706.8585.4182 1.336.4241.6332-.0032 1.2399-.2545 1.69-.7.3377-.3337.5684-.7604.6626-1.2258.0942-.4653.0477-.9481-.1336-1.3869-.1814-.4388-.4892-.8137-.8844-1.0768s-.8599-.4025-1.3346-.4005z" fill="#2667ff"/></svg>',
};

/*
 * Dashboard Metrics
 */
export function getDashboardMetrics(t: (key: string) => string): DashboardMetricConfig[] {
    return [
        {
            key: "activeBundles",
            title: t("activeBundles"),
            format: "number",
            action: { label: t("viewDetails"), url: ROUTES.BUNDLES },
            img: {
                svg: DASHBOARD_METRICS_SVG["activeBundles"],
            },
        },
        {
            key: "totalRevenue",
            title: t("totalRevenue"),
            format: "currency",
            tone: "success",
            icon: "arrow-up",
            action: { label: t("viewDetails"), url: ROUTES.ANALYTICS },
            img: {
                svg: DASHBOARD_METRICS_SVG["totalRevenue"],
            },
        },
        {
            key: "avgConversionRate",
            title: t("conversionRate"),
            format: "percentage",
            tone: "warning",
            icon: "arrow-up",
            action: { label: t("viewDetails"), url: ROUTES.ANALYTICS },
            img: {
                svg: DASHBOARD_METRICS_SVG["conversionRate"],
            },
        },
        {
            key: "totalViews",
            title: t("totalViews"),
            format: "number",
            tone: "info",
            icon: "arrow-down",
            comparisonLabel: t("last30Days"),
            action: { label: t("viewDetails"), url: ROUTES.ANALYTICS },
            img: {
                svg: DASHBOARD_METRICS_SVG["totalViews"],
            },
        },
    ];
}

/*
 * Metric card SVGs
 */
const DASHBOARD_QUICK_ACTIONS_SVG = {
    manageBundle:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#affebf" height="44" rx="6" width="44"/><g fill="#047b5d"><path clip-rule="evenodd" d="m16 13.6c-.6365 0-1.247.2528-1.6971.7029s-.7029 1.0606-.7029 1.6971v2.4c0 .6365.2528 1.2469.7029 1.697s1.0606.703 1.6971.703h2.4c.6365 0 1.2469-.2529 1.697-.703s.703-1.0605.703-1.697v-2.4c0-.6365-.2529-1.247-.703-1.6971s-1.0605-.7029-1.697-.7029zm-.6 2.4c0-.1592.0632-.3118.1757-.4243s.2651-.1757.4243-.1757h2.4c.1591 0 .3117.0632.4242.1757.1126.1125.1758.2651.1758.4243v2.4c0 .1591-.0632.3117-.1758.4242-.1125.1126-.2651.1758-.4242.1758h-2.4c-.1592 0-.3118-.0632-.4243-.1758-.1125-.1125-.1757-.2651-.1757-.4242z" fill-rule="evenodd"/><path clip-rule="evenodd" d="m16 23.2c-.6365 0-1.247.2528-1.6971.7029s-.7029 1.0605-.7029 1.6971v2.4c0 .6365.2528 1.2469.7029 1.697s1.0606.703 1.6971.703h2.4c.6365 0 1.2469-.2529 1.697-.703s.703-1.0605.703-1.697v-2.4c0-.6366-.2529-1.247-.703-1.6971s-1.0605-.7029-1.697-.7029zm-.6 2.4c0-.1592.0632-.3118.1757-.4243s.2651-.1757.4243-.1757h2.4c.1591 0 .3117.0632.4242.1757.1126.1125.1758.2651.1758.4243v2.4c0 .1591-.0632.3117-.1758.4242-.1125.1125-.2651.1758-.4242.1758h-2.4c-.1592 0-.3118-.0633-.4243-.1758s-.1757-.2651-.1757-.4242z" fill-rule="evenodd"/><path d="m22 15.7c0-.2386.0948-.4676.2636-.6363.1688-.1688.3977-.2637.6364-.2637h6.6c.2387 0 .4676.0949.6364.2637.1688.1687.2636.3977.2636.6363 0 .2387-.0948.4677-.2636.6364-.1688.1688-.3977.2636-.6364.2636h-6.6c-.2387 0-.4676-.0948-.6364-.2636-.1688-.1687-.2636-.3977-.2636-.6364z"/><path d="m22.9 17.8c-.2387 0-.4676.0949-.6364.2637-.1688.1687-.2636.3977-.2636.6363 0 .2387.0948.4677.2636.6364.1688.1688.3977.2636.6364.2636h5.4c.2387 0 .4676-.0948.6364-.2636.1688-.1687.2636-.3977.2636-.6364 0-.2386-.0948-.4676-.2636-.6363-.1688-.1688-.3977-.2637-.6364-.2637z"/><path d="m22 25.3c0-.2387.0948-.4676.2636-.6364s.3977-.2636.6364-.2636h6.6c.2387 0 .4676.0948.6364.2636s.2636.3977.2636.6364-.0948.4676-.2636.6364-.3977.2636-.6364.2636h-6.6c-.2387 0-.4676-.0948-.6364-.2636s-.2636-.3977-.2636-.6364z"/><path d="m22.9 27.4c-.2387 0-.4676.0948-.6364.2636s-.2636.3977-.2636.6364.0948.4676.2636.6364.3977.2636.6364.2636h4.2c.2387 0 .4676-.0948.6364-.2636s.2636-.3977.2636-.6364-.0948-.4676-.2636-.6364-.3977-.2636-.6364-.2636z"/></g></svg>',
    vewAnalytics:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#dfd9ff" height="44" rx="6" width="44"/><g clip-rule="evenodd" fill="#7126ff" fill-rule="evenodd"><path d="m14.8 21.4c.2387 0 .4676.0948.6364.2636s.2636.3977.2636.6364v7.2c0 .2387-.0948.4676-.2636.6364s-.3977.2636-.6364.2636-.4676-.0948-.6364-.2636-.2636-.3977-.2636-.6364v-7.2c0-.2387.0948-.4676.2636-.6364s.3977-.2636.6364-.2636z"/><path d="m29.2 21.4c.2387 0 .4677.0948.6364.2636.1688.1688.2636.3977.2636.6364v7.2c0 .2387-.0948.4676-.2636.6364-.1687.1688-.3977.2636-.6364.2636-.2386 0-.4676-.0948-.6363-.2636-.1688-.1688-.2637-.3977-.2637-.6364v-7.2c0-.2387.0949-.4676.2637-.6364.1687-.1688.3977-.2636.6363-.2636z"/><path d="m19.6 21.4c.2386 0 .4676.0948.6363.2636.1688.1688.2637.3977.2637.6364v7.2c0 .2387-.0949.4676-.2637.6364-.1687.1688-.3977.2636-.6363.2636-.2387 0-.4677-.0948-.6364-.2636-.1688-.1688-.2636-.3977-.2636-.6364v-7.2c0-.2387.0948-.4676.2636-.6364.1687-.1688.3977-.2636.6364-.2636z"/><path d="m24.4 13.6c.2387 0 .4676.0948.6364.2636s.2636.3977.2636.6364v15c0 .2387-.0948.4676-.2636.6364s-.3977.2636-.6364.2636-.4676-.0948-.6364-.2636-.2636-.3977-.2636-.6364v-15c0-.2387.0948-.4676.2636-.6364s.3977-.2636.6364-.2636z"/></g></svg>',
    bundleStudio:
        '<svg fill="none" height="44" viewBox="0 0 44 44" width="44" xmlns="http://www.w3.org/2000/svg"><rect fill="#d5ebff" height="44" rx="6" width="44"/><path clip-rule="evenodd" d="m16.2604 17.44c-.2364.2232-.2604.366-.2604.42s.024.1968.2604.42c.24.2268.6336.4716 1.1952.696 1.1172.4476 2.724.744 4.5444.744s3.426-.2964 4.5444-.744c.5616-.2244.9564-.4692 1.1952-.696.2364-.2232.2604-.366.2604-.42s-.024-.1968-.2604-.42c-.24-.2268-.6336-.4716-1.1952-.696-1.1184-.4476-2.724-.744-4.5444-.744s-3.4272.2964-4.5444.744c-.5616.2244-.9564.4692-1.1952.696zm11.7396 2.8404c-.2548.1381-.5177.2607-.7872.3672-1.3788.552-3.222.8724-5.2128.8724s-3.834-.3216-5.2128-.8724c-.2696-.1065-.5325-.2291-.7872-.3672v1.6956c0 .054.024.1968.2604.42.24.2268.6336.4716 1.1952.696 1.1172.4476 2.724.744 4.5444.744s3.426-.2964 4.5444-.744c.5616-.2244.9564-.4692 1.1952-.696.2364-.2232.2604-.366.2604-.42zm0 4.116c-.2548.1381-.5177.2607-.7872.3672-1.3788.552-3.222.8724-5.2128.8724s-3.834-.3216-5.2128-.8724c-.2696-.1065-.5325-.2291-.7872-.3672v1.7436c0 .054.024.1968.2604.42.24.2268.6336.4716 1.1952.696 1.1172.4476 2.724.744 4.5444.744s3.426-.2964 4.5444-.744c.5616-.2244.9564-.4692 1.1952-.696.2364-.2244.2604-.366.2604-.42zm1.8 1.7436c0 .708-.3624 1.2924-.8244 1.728-.4584.4344-1.0752.7848-1.7628 1.0596-1.3788.552-3.222.8724-5.2128.8724s-3.834-.3216-5.2128-.8724c-.6876-.276-1.3044-.624-1.764-1.0596-.4608-.4356-.8232-1.02-.8232-1.728v-8.28c0-.708.3624-1.2924.8244-1.728.4584-.4344 1.0752-.7848 1.7628-1.0596 1.3788-.552 3.222-.8724 5.2128-.8724s3.834.3216 5.2128.8724c.6876.276 1.3044.624 1.764 1.0596.4608.4356.8232 1.02.8232 1.728z" fill="#005bd3" fill-rule="evenodd" opacity=".92"/></svg>',
};
/*
 * Dashboard Quick Actions
 */
export function getDashboardQuickActions(t: (key: string) => string): DashboardQuickActionItem[] {
    return [
        {
            id: "bundles",
            title: t("manageBundle"),
            description: t("manageBundleDesc"),
            icon: "text-in-rows",
            tone: "success",
            url: ROUTES.BUNDLES,
            ...ACTION_THEMES.success,
            enabled: true,
            img: {
                svg: DASHBOARD_QUICK_ACTIONS_SVG["manageBundle"],
            },
        },
        {
            id: "analytics",
            title: t("viewAnalytics"),
            description: t("viewAnalyticsDesc"),
            icon: "chart-histogram-second-last",
            tone: "info",
            url: ROUTES.ANALYTICS,
            ...ACTION_THEMES.info,
            enabled: true,
            img: {
                svg: DASHBOARD_QUICK_ACTIONS_SVG["vewAnalytics"],
            },
        },
        {
            id: "settings",
            title: t("appSettings"),
            description: t("appSettingsDesc"),
            icon: "database",
            tone: "info",
            url: ROUTES.SETTINGS,
            ...ACTION_THEMES.info,
            enabled: true,
            img: {
                svg: DASHBOARD_QUICK_ACTIONS_SVG["bundleStudio"],
            },
        },
    ];
}

/*
 * Dashboard Callout Cards
 */

export function getDashboardCalloutCards(t: (key: string) => string): DashboardCalloutCardsItem[] {
    return [
        {
            title: t("support.title"),
            description: t("support.description"),
            primaryButton: {
                content: t("support.button"),
                props: {
                    url: "https://www.example.com",
                    external: true,
                },
                tone: "critical",
            },
            icon: "email",
        },
        {
            title: t("features.title"),
            description: t("features.description"),
            primaryButton: {
                content: t("features.button"),
                props: {
                    url: "https://www.example.com",
                    external: true,
                },
                tone: "neutral",
            },
            icon: "star",
        },
        {
            title: t("helpDocs.title"),
            description: t("helpDocs.description"),
            primaryButton: {
                content: t("helpDocs.button"),
                props: {
                    url: "https://www.example.com",
                    external: true,
                },
                tone: "neutral",
            },
            icon: "book",
        },
    ];
}

/*
 * Setup Guide Steps
 */
export function getSetupGuideSteps(t: (key: string) => string): SetupGuideStep[] {
    return [
        {
            id: 0,
            stepKey: SETUP_STEP_KEYS.APP_EMBED,
            title: t("steps.enableAppEmbed.title"),
            description: t("steps.enableAppEmbed.description"),
            image: {
                url: "/assets/setup-guide-step-one.svg",
                alt: "Enable app embed in theme editor",
            },
            primaryButton: { content: t("steps.enableAppEmbed.primaryButton") },
            secondaryButton: { content: t("steps.enableAppEmbed.secondaryButton") },
        },
        {
            id: 1,
            stepKey: SETUP_STEP_KEYS.FIRST_BUNDLE,
            title: t("steps.createFirstBundle.title"),
            description: t("steps.createFirstBundle.description"),
            image: {
                url: "/assets/setup-guide-step-two.svg",
                alt: "Create a product bundle",
            },
            primaryButton: {
                content: t("steps.createFirstBundle.primaryButton"),
                internalUrl: ROUTES.BUNDLE_CREATE,
            },
        },
        {
            id: 2,
            stepKey: SETUP_STEP_KEYS.WIDGET_CUSTOMIZED,
            title: t("steps.customizeSettings.title"),
            description: t("steps.customizeSettings.description"),
            image: {
                url: "/assets/setup-guide-step-three.svg",
                alt: "Configure settings and style customizer",
            },
            primaryButton: {
                content: t("steps.customizeSettings.primaryButton"),
                internalUrl: ROUTES.SETTINGS,
            },
        },
        {
            id: 3,
            stepKey: SETUP_STEP_KEYS.STOREFRONT_PREVIEW,
            title: t("steps.previewStorefront.title"),
            description: t("steps.previewStorefront.description"),
            image: {
                url: "/assets/setup-guide-step-four.svg",
                alt: "Preview bundle on storefront",
            },
            primaryButton: { content: t("steps.previewStorefront.primaryButton") },
        },
        {
            id: 4,
            stepKey: SETUP_STEP_KEYS.ANALYTICS_VIEWED,
            title: t("steps.monitorAnalytics.title"),
            description: t("steps.monitorAnalytics.description"),
            image: {
                url: "/assets/setup-guide-step-five.svg",
                alt: "Bundle analytics dashboard",
            },
            primaryButton: {
                content: t("steps.monitorAnalytics.primaryButton"),
                internalUrl: ROUTES.ANALYTICS,
            },
        },
    ];
}

/*
 * Dashboard Video Items Link
 */
export function getDashboardVideoItems(t: (key: string) => string): DashboardVideoConfig[] {
    return [
        {
            id: 1,
            videoUrl: "https://www.youtube.com/watch?v=sRWcJrMTtMI",
            title: t("seeInAction"),
            description: t("videoDescription"),
        },
        {
            id: 2,
            videoUrl: "https://www.youtube.com/watch?v=-S0FiZnAmTk",
            title: t("gettingStarted"),
            description: t("videoDescription"),
        },
        {
            id: 3,
            videoUrl: "https://www.youtube.com/watch?v=ANmgjWMt6tg",
            title: t("advancedTips"),
            description: t("videoDescription"),
        },
    ];
}

/*
 * Dashboard Review Messages
 */
export const RATING_MESSAGES = {
    0: {
        title: "How would you rate our app?",
        description:
            "Your feedback helps us improve the experience for everyone. It will take you less than a minute.",
    },
    1: {
        title: "We're sorry to hear that!",
        description: "Help us improve by telling us what went wrong.",
    },
    2: {
        title: "We can do better!",
        description:
            "Let us know what we can improve to make your experience better.",
    },
    3: {
        title: "Thanks for the feedback!",
        description:
            "We'd love to know how we can make this even better for you.",
    },
    4: {
        title: "Great to hear!",
        description:
            "What did you like most? Your feedback helps us keep improving.",
    },
    5: {
        title: "Awesome!",
        description:
            "We're thrilled you love our app! Consider sharing your experience.",
    },
} as const;
