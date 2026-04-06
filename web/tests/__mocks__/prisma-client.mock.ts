export const PlanName = {
    FREE: "FREE",
    PRO: "PRO",
} as const;

export const ShopifySubscriptionStatus = {
    ACTIVE: "ACTIVE",
    CANCELLED: "CANCELLED",
    DECLINED: "DECLINED",
    EXPIRED: "EXPIRED",
    FROZEN: "FROZEN",
    PENDING: "PENDING",
} as const;

export const ShopStatus = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    TRIAL_EXPIRED: "TRIAL_EXPIRED",
    NOT_CONFIGURED: "NOT_CONFIGURED",
} as const;

export const Prisma = {
    Bundle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    BundleProduct: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
};

export default {
    bundle: Prisma.Bundle,
    bundleProduct: Prisma.BundleProduct,
};
