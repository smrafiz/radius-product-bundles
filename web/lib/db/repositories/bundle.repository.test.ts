import { bundleRepository } from "@/lib/db";
import { prismaMock } from "@/tests/mocks/prisma/prisma.mock";
import { createMockBundle } from "@/tests/fixtures/bundles.fixture";

describe("BundleRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findByShop", () => {
        it("should find bundles by shop", async () => {
            const mockBundles = [createMockBundle()];
            prismaMock.bundle.findMany.mockResolvedValue(mockBundles);

            const result = await bundleRepository.findByShop(
                "test-shop.myshopify.com",
            );

            expect(result).toEqual(mockBundles);
            expect(prismaMock.bundle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        shop: "test-shop.myshopify.com",
                    }),
                }),
            );
        });
    });

    describe("countByShop", () => {
        it("should count bundles by shop", async () => {
            prismaMock.bundle.count.mockResolvedValue(5);

            const count = await bundleRepository.countByShop(
                "test-shop.myshopify.com",
            );

            expect(count).toBe(5);
        });
    });
});
