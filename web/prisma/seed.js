// prisma/seed.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting database seed...");

    try {
        // Clear existing data in the correct order (to respect foreign key constraints)
        console.log("Clearing existing data...");

        // First delete tables that have foreign key dependencies
        await prisma.testResult.deleteMany();
        await prisma.automationBundle.deleteMany();
        await prisma.automationLog.deleteMany();
        await prisma.pricingRuleBundle.deleteMany();
        await prisma.bundleAnalytics.deleteMany();
        await prisma.bundleProduct.deleteMany();
        await prisma.templateReview.deleteMany();

        // Then delete the parent tables
        await prisma.aBTest.deleteMany();
        await prisma.automation.deleteMany();
        await prisma.pricingRule.deleteMany();
        await prisma.bundle.deleteMany();
        await prisma.template.deleteMany();
        await prisma.aIInsight.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.alertRule.deleteMany();
        await prisma.appSettings.deleteMany();

        console.log("Existing data cleared");

        // Create AppSettings
        console.log("Creating AppSettings...");
        const appSettings = await prisma.appSettings.create({
            data: {
                shop: "bundles47.myshopify.com",
                defaultDiscountType: "PERCENTAGE",
                defaultDiscountValue: 10,
                maxBundleProducts: 10,
                aiOptimizations: true,
                betaFeatures: false,
                emailNotifications: true,
                weeklyDigest: true,
                aiRecommendations: true,
            },
        });
        console.log("AppSettings created:", appSettings.id);

        // Create Bundles
        console.log("Creating Bundles...");
        const bundles = await Promise.all([
            prisma.bundle.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Summer Collection Bundle",
                    description: "Get all our summer essentials in one bundle",
                    type: "BUY_X_GET_Y",
                    status: "ACTIVE",
                    mainProductId: "gid://shopify/Product/123456789",
                    discountType: "PERCENTAGE",
                    discountValue: 15,
                    minOrderValue: 50,
                    maxDiscountAmount: 20,
                    images: [
                        "https://example.com/image1.jpg",
                        "https://example.com/image2.jpg",
                    ],
                    marketingCopy: "Perfect for summer adventures!",
                    seoTitle: "Summer Essentials Bundle",
                    seoDescription:
                        "Get all summer essentials in one money-saving bundle",
                    views: 1250,
                    conversions: 42,
                    revenue: 3150.75,
                    startDate: new Date("2023-06-01"),
                    endDate: new Date("2023-08-31"),
                    aiOptimized: true,
                    aiScore: 8.7,
                },
            }),
            prisma.bundle.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Skincare Routine",
                    description: "Complete daily skincare routine bundle",
                    type: "VOLUME_DISCOUNT",
                    status: "ACTIVE",
                    discountType: "FIXED",
                    discountValue: 25,
                    minOrderValue: 75,
                    images: ["https://example.com/skincare1.jpg"],
                    marketingCopy: "Your complete skincare solution",
                    seoTitle: "Daily Skincare Bundle",
                    seoDescription: "Everything you need for healthy skin",
                    views: 890,
                    conversions: 28,
                    revenue: 2100.5,
                    aiOptimized: true,
                    aiScore: 7.5,
                },
            }),
            prisma.bundle.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Winter Special",
                    description: "Stay warm with our winter collection",
                    type: "BOGO",
                    status: "DRAFT",
                    discountType: "PERCENTAGE",
                    discountValue: 50,
                    minOrderValue: 30,
                    images: ["https://example.com/winter1.jpg"],
                    marketingCopy: "Buy one, get one 50% off",
                    seoTitle: "Winter Special Bundle",
                    seoDescription: "Warm up with our winter collection",
                    views: 320,
                    conversions: 12,
                    revenue: 450.25,
                    aiOptimized: false,
                },
            }),
        ]);
        console.log("Bundles created:", bundles.length);

        // Create BundleProducts
        console.log("Creating BundleProducts...");
        await Promise.all([
            prisma.bundleProduct.create({
                data: {
                    bundleId: bundles[0].id,
                    productId: "gid://shopify/Product/111",
                    variantId: "gid://shopify/ProductVariant/111-1",
                    quantity: 1,
                    displayOrder: 1,
                    isMain: true,
                },
            }),
            prisma.bundleProduct.create({
                data: {
                    bundleId: bundles[0].id,
                    productId: "gid://shopify/Product/222",
                    variantId: "gid://shopify/ProductVariant/222-1",
                    quantity: 2,
                    displayOrder: 2,
                    isMain: false,
                },
            }),
            prisma.bundleProduct.create({
                data: {
                    bundleId: bundles[1].id,
                    productId: "gid://shopify/Product/333",
                    variantId: "gid://shopify/ProductVariant/333-1",
                    quantity: 1,
                    displayOrder: 1,
                    isMain: true,
                },
            }),
            prisma.bundleProduct.create({
                data: {
                    bundleId: bundles[1].id,
                    productId: "gid://shopify/Product/444",
                    variantId: "gid://shopify/ProductVariant/444-1",
                    quantity: 1,
                    displayOrder: 2,
                    isMain: false,
                },
            }),
            prisma.bundleProduct.create({
                data: {
                    bundleId: bundles[2].id,
                    productId: "gid://shopify/Product/555",
                    variantId: "gid://shopify/ProductVariant/555-1",
                    quantity: 1,
                    displayOrder: 1,
                    isMain: true,
                },
            }),
        ]);
        console.log("BundleProducts created");

        // Create ABTests
        console.log("Creating ABTests...");
        const abTests = await Promise.all([
            prisma.aBTest.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Summer Bundle Pricing Test",
                    hypothesis: "Lower discount will increase perceived value",
                    type: "PRICING",
                    status: "COMPLETED",
                    trafficSplit: 50,
                    duration: 14,
                    minSampleSize: 200,
                    controlBundleId: bundles[0].id,
                    variantConfig: {
                        discountValue: 10,
                        marketingCopy: "Premium summer essentials bundle",
                    },
                    winner: "variant",
                    significance: 0.95,
                    improvement: 12.5,
                    startedAt: new Date("2023-06-15"),
                    completedAt: new Date("2023-06-29"),
                },
            }),
            prisma.aBTest.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Skincare Bundle Images",
                    hypothesis: "Lifestyle images will convert better",
                    type: "LAYOUT",
                    status: "RUNNING",
                    trafficSplit: 50,
                    duration: 21,
                    minSampleSize: 150,
                    controlBundleId: bundles[1].id,
                    variantConfig: {
                        images: ["https://example.com/skincare-lifestyle.jpg"],
                    },
                    startedAt: new Date("2023-07-01"),
                },
            }),
        ]);
        console.log("ABTests created");

        // Create TestResults
        console.log("Creating TestResults...");
        await Promise.all([
            prisma.testResult.create({
                data: {
                    testId: abTests[0].id,
                    variant: "control",
                    date: new Date("2023-06-16"),
                    views: 120,
                    conversions: 15,
                    revenue: 1125.5,
                },
            }),
            prisma.testResult.create({
                data: {
                    testId: abTests[0].id,
                    variant: "variant",
                    date: new Date("2023-06-16"),
                    views: 125,
                    conversions: 18,
                    revenue: 1350.75,
                },
            }),
            prisma.testResult.create({
                data: {
                    testId: abTests[1].id,
                    variant: "control",
                    date: new Date("2023-07-02"),
                    views: 85,
                    conversions: 10,
                    revenue: 750.25,
                },
            }),
            prisma.testResult.create({
                data: {
                    testId: abTests[1].id,
                    variant: "variant",
                    date: new Date("2023-07-02"),
                    views: 90,
                    conversions: 12,
                    revenue: 900.5,
                },
            }),
        ]);
        console.log("TestResults created");

        // Create Automations
        console.log("Creating Automations...");
        const automations = await Promise.all([
            prisma.automation.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Low Stock Alert",
                    description: "Notify when bundle products are low in stock",
                    status: "ACTIVE",
                    triggerType: "INVENTORY",
                    triggerConfig: { threshold: 5 },
                    conditions: { productType: "bundle" },
                    actions: { sendEmail: true, createAlert: true },
                },
            }),
            prisma.automation.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Bundle Performance Report",
                    description: "Weekly bundle performance summary",
                    status: "ACTIVE",
                    triggerType: "SCHEDULE",
                    triggerConfig: { frequency: "weekly", day: "monday" },
                    conditions: {},
                    actions: { sendEmail: true, generateReport: true },
                },
            }),
            prisma.automation.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Abandoned Cart Recovery",
                    description: "Recover abandoned carts with bundle offers",
                    status: "PAUSED",
                    triggerType: "CUSTOMER_BEHAVIOR",
                    triggerConfig: {
                        event: "cart_abandoned",
                        timeWindow: "1h",
                    },
                    conditions: {},
                    actions: { sendEmail: true, applyDiscount: true },
                },
            }),
        ]);
        console.log("Automations created");

        // Create AutomationBundles
        console.log("Creating AutomationBundles...");
        await Promise.all([
            prisma.automationBundle.create({
                data: {
                    automationId: automations[0].id,
                    bundleId: bundles[0].id,
                },
            }),
            prisma.automationBundle.create({
                data: {
                    automationId: automations[0].id,
                    bundleId: bundles[1].id,
                },
            }),
            prisma.automationBundle.create({
                data: {
                    automationId: automations[1].id,
                    bundleId: bundles[0].id,
                },
            }),
            prisma.automationBundle.create({
                data: {
                    automationId: automations[1].id,
                    bundleId: bundles[1].id,
                },
            }),
            prisma.automationBundle.create({
                data: {
                    automationId: automations[2].id,
                    bundleId: bundles[0].id,
                },
            }),
        ]);
        console.log("AutomationBundles created");

        // Create AutomationLogs
        console.log("Creating AutomationLogs...");
        await Promise.all([
            prisma.automationLog.create({
                data: {
                    automationId: automations[0].id,
                    event: "low_stock_alert",
                    success: true,
                    data: { productId: "gid://shopify/Product/111", stock: 3 },
                },
            }),
            prisma.automationLog.create({
                data: {
                    automationId: automations[1].id,
                    event: "weekly_report",
                    success: true,
                    data: { bundles: 2, revenue: 5251.25 },
                },
            }),
            prisma.automationLog.create({
                data: {
                    automationId: automations[2].id,
                    event: "cart_abandoned",
                    success: false,
                    error: "Email service unavailable",
                },
            }),
        ]);
        console.log("AutomationLogs created");

        // Create PricingRules
        console.log("Creating PricingRules...");
        const pricingRules = await Promise.all([
            prisma.pricingRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "VIP Customer Discount",
                    priority: 1,
                    status: "ACTIVE",
                    conditions: { customerTier: "VIP" },
                    discountType: "PERCENTAGE",
                    discountValue: 20,
                    maxDiscountAmount: 50,
                },
            }),
            prisma.pricingRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "First Time Buyer",
                    priority: 2,
                    status: "ACTIVE",
                    conditions: { firstOrder: true },
                    discountType: "FIXED",
                    discountValue: 15,
                },
            }),
            prisma.pricingRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Holiday Special",
                    priority: 3,
                    status: "INACTIVE",
                    conditions: { holiday: "christmas" },
                    discountType: "PERCENTAGE",
                    discountValue: 25,
                },
            }),
        ]);
        console.log("PricingRules created");

        // Create PricingRuleBundles
        console.log("Creating PricingRuleBundles...");
        await Promise.all([
            prisma.pricingRuleBundle.create({
                data: {
                    pricingRuleId: pricingRules[0].id,
                    bundleId: bundles[0].id,
                },
            }),
            prisma.pricingRuleBundle.create({
                data: {
                    pricingRuleId: pricingRules[0].id,
                    bundleId: bundles[1].id,
                },
            }),
            prisma.pricingRuleBundle.create({
                data: {
                    pricingRuleId: pricingRules[1].id,
                    bundleId: bundles[0].id,
                },
            }),
            prisma.pricingRuleBundle.create({
                data: {
                    pricingRuleId: pricingRules[2].id,
                    bundleId: bundles[2].id,
                },
            }),
        ]);
        console.log("PricingRuleBundles created");

        // Create BundleAnalytics
        console.log("Creating BundleAnalytics...");
        await Promise.all([
            prisma.bundleAnalytics.create({
                data: {
                    bundleId: bundles[0].id,
                    date: new Date("2023-07-01"),
                    hour: 10,
                    bundleViews: 45,
                    bundleAddToCarts: 8,
                    bundlePurchases: 3,
                    bundleRevenue: 225.75,
                    crossSellViews: 12,
                    crossSellPurchases: 1,
                    newCustomerPurchases: 2,
                    returningCustomerPurchases: 1,
                },
            }),
            prisma.bundleAnalytics.create({
                data: {
                    bundleId: bundles[1].id,
                    date: new Date("2023-07-01"),
                    hour: 14,
                    bundleViews: 32,
                    bundleAddToCarts: 5,
                    bundlePurchases: 2,
                    bundleRevenue: 150.25,
                    crossSellViews: 8,
                    crossSellPurchases: 0,
                    newCustomerPurchases: 1,
                    returningCustomerPurchases: 1,
                },
            }),
            prisma.bundleAnalytics.create({
                data: {
                    bundleId: bundles[0].id,
                    date: new Date("2023-07-02"),
                    bundleViews: 52,
                    bundleAddToCarts: 10,
                    bundlePurchases: 4,
                    bundleRevenue: 300.5,
                    crossSellViews: 15,
                    crossSellPurchases: 2,
                    newCustomerPurchases: 3,
                    returningCustomerPurchases: 1,
                },
            }),
        ]);
        console.log("BundleAnalytics created");

        // Create AIInsights
        console.log("Creating AIInsights...");
        await Promise.all([
            prisma.aIInsight.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "RECOMMENDATION",
                    category: "pricing",
                    title: "Increase Summer Bundle Price",
                    description:
                        "Based on conversion elasticity, increasing price by 5% could increase revenue",
                    confidence: 0.85,
                    impact: "medium",
                    actionable: true,
                    actionType: "update_pricing",
                    actionData: { bundleId: bundles[0].id, newPrice: 52.5 },
                    bundleId: bundles[0].id,
                    expiresAt: new Date("2023-08-01"),
                },
            }),
            prisma.aIInsight.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "OPTIMIZATION",
                    category: "marketing",
                    title: "Improve Skincare Bundle Images",
                    description:
                        "Lifestyle images show 12% better conversion in A/B tests",
                    confidence: 0.92,
                    impact: "high",
                    actionable: true,
                    actionType: "update_images",
                    actionData: {
                        bundleId: bundles[1].id,
                        newImages: ["lifestyle1.jpg", "lifestyle2.jpg"],
                    },
                    bundleId: bundles[1].id,
                    testId: abTests[1].id,
                    expiresAt: new Date("2023-07-15"),
                },
            }),
            prisma.aIInsight.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "WARNING",
                    category: "inventory",
                    title: "Low Stock on Winter Bundle",
                    description:
                        "Winter bundle product stock is below threshold",
                    confidence: 0.98,
                    impact: "high",
                    actionable: true,
                    actionType: "reorder",
                    actionData: {
                        productId: "gid://shopify/Product/555",
                        quantity: 50,
                    },
                    bundleId: bundles[2].id,
                    expiresAt: new Date("2023-07-10"),
                },
            }),
        ]);
        console.log("AIInsights created");

        // Create Templates
        console.log("Creating Templates...");
        const templates = await Promise.all([
            prisma.template.create({
                data: {
                    name: "Summer Essentials",
                    description: "Perfect bundle for summer products",
                    category: "seasonal",
                    bundleType: "BUY_X_GET_Y",
                    difficulty: "EASY",
                    bundleConfig: {
                        products: 3,
                        discountType: "percentage",
                        discountValue: 15,
                    },
                    pricingConfig: { minOrderValue: 50 },
                    marketingConfig: {
                        images: 2,
                        marketingCopy: "Summer essentials bundle",
                    },
                    downloads: 125,
                    rating: 4.5,
                    reviewCount: 8,
                    createdBy: "admin",
                    isPublic: true,
                    isOfficial: true,
                },
            }),
            prisma.template.create({
                data: {
                    name: "Skincare Routine",
                    description: "Complete daily skincare bundle",
                    category: "beauty",
                    bundleType: "VOLUME_DISCOUNT",
                    difficulty: "MEDIUM",
                    bundleConfig: {
                        products: 4,
                        discountType: "fixed",
                        discountValue: 25,
                    },
                    pricingConfig: { minOrderValue: 75 },
                    marketingConfig: {
                        images: 3,
                        marketingCopy: "Complete skincare routine",
                    },
                    downloads: 89,
                    rating: 4.2,
                    reviewCount: 5,
                    createdBy: "admin",
                    isPublic: true,
                    isOfficial: false,
                },
            }),
            prisma.template.create({
                data: {
                    name: "Holiday Gift Set",
                    description: "Perfect holiday gift bundle",
                    category: "gift",
                    bundleType: "GIFT",
                    difficulty: "HARD",
                    bundleConfig: {
                        products: 5,
                        discountType: "percentage",
                        discountValue: 20,
                    },
                    pricingConfig: { minOrderValue: 100 },
                    marketingConfig: {
                        images: 4,
                        marketingCopy: "Holiday gift set",
                    },
                    downloads: 64,
                    rating: 4.7,
                    reviewCount: 12,
                    createdBy: "admin",
                    isPublic: true,
                    isOfficial: true,
                },
            }),
        ]);
        console.log("Templates created");

        // Create TemplateReviews
        console.log("Creating TemplateReviews...");
        await Promise.all([
            prisma.templateReview.create({
                data: {
                    templateId: templates[0].id,
                    shop: "shop1.myshopify.com",
                    rating: 5,
                    review: "Perfect template for our summer collection!",
                    helpful: 8,
                },
            }),
            prisma.templateReview.create({
                data: {
                    templateId: templates[0].id,
                    shop: "shop2.myshopify.com",
                    rating: 4,
                    review: "Good template, but needed some customization",
                    helpful: 3,
                },
            }),
            prisma.templateReview.create({
                data: {
                    templateId: templates[1].id,
                    shop: "shop3.myshopify.com",
                    rating: 4,
                    review: "Worked well for our skincare products",
                    helpful: 5,
                },
            }),
            prisma.templateReview.create({
                data: {
                    templateId: templates[2].id,
                    shop: "shop4.myshopify.com",
                    rating: 5,
                    review: "Our customers loved the holiday gift sets!",
                    helpful: 12,
                },
            }),
        ]);
        console.log("TemplateReviews created");

        // Create Notifications
        console.log("Creating Notifications...");
        await Promise.all([
            prisma.notification.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "BUNDLE_PERFORMANCE",
                    title: "Summer Bundle Performance Update",
                    message:
                        "Your summer bundle is performing 25% better than last week",
                    data: { bundleId: bundles[0].id, improvement: 25 },
                    priority: "NORMAL",
                    actionLabel: "View Details",
                    actionUrl: "/bundles/123",
                    expiresAt: new Date("2023-07-10"),
                },
            }),
            prisma.notification.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "AI_RECOMMENDATION",
                    title: "New AI Insight Available",
                    message:
                        "AI recommends updating your skincare bundle images",
                    data: { insightId: "insight-123" },
                    priority: "HIGH",
                    actionLabel: "View Insight",
                    actionUrl: "/insights/123",
                    expiresAt: new Date("2023-07-15"),
                },
            }),
            prisma.notification.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "TEST_COMPLETED",
                    title: "A/B Test Completed",
                    message:
                        "Your pricing test has finished with significant results",
                    data: { testId: abTests[0].id },
                    priority: "NORMAL",
                    actionLabel: "View Results",
                    actionUrl: "/ab-tests/123",
                    expiresAt: new Date("2023-07-05"),
                },
            }),
            prisma.notification.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "AUTOMATION_ERROR",
                    title: "Automation Failed",
                    message: "Abandoned cart recovery automation failed to run",
                    data: { automationId: automations[2].id },
                    priority: "HIGH",
                    actionLabel: "Fix Automation",
                    actionUrl: "/automations/123",
                },
            }),
            prisma.notification.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    type: "MILESTONE_REACHED",
                    title: "Bundle Revenue Milestone",
                    message:
                        "Your bundles have generated over $5,000 in revenue!",
                    data: { revenue: 5251.25 },
                    priority: "NORMAL",
                    actionLabel: "View Analytics",
                    actionUrl: "/analytics",
                },
            }),
        ]);
        console.log("Notifications created");

        // Create AlertRules
        console.log("Creating AlertRules...");
        await Promise.all([
            prisma.alertRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Low Conversion Alert",
                    type: "BUNDLE_PERFORMANCE",
                    status: "ACTIVE",
                    conditions: {
                        metric: "conversionRate",
                        operator: "<",
                        value: 2,
                    },
                    threshold: 2,
                    comparison: "<",
                    deliveryMethods: { email: true, push: true },
                    frequency: "DAILY",
                },
            }),
            prisma.alertRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "High Revenue Alert",
                    type: "BUNDLE_PERFORMANCE",
                    status: "ACTIVE",
                    conditions: {
                        metric: "revenue",
                        operator: ">",
                        value: 1000,
                    },
                    threshold: 1000,
                    comparison: ">",
                    deliveryMethods: { email: true },
                    frequency: "IMMEDIATE",
                },
            }),
            prisma.alertRule.create({
                data: {
                    shop: "bundles47.myshopify.com",
                    name: "Automation Failure Alert",
                    type: "AUTOMATION_ERROR",
                    status: "ACTIVE",
                    conditions: {
                        metric: "failureRate",
                        operator: ">",
                        value: 0.1,
                    },
                    threshold: 0.1,
                    comparison: ">",
                    deliveryMethods: { email: true, slack: true },
                    frequency: "HOURLY",
                },
            }),
        ]);
        console.log("AlertRules created");

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
