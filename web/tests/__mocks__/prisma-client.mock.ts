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
