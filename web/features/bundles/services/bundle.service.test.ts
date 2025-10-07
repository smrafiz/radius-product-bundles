// tests/unit/features/bundles/services/bundle.service.test.ts
import { bundleService } from "@/features/bundles/services";
import { bundleRepository } from "@/lib/db/repositories";
import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import { createMockBundle } from "@/tests/fixtures/bundles.fixture";

jest.mock("@/lib/db/repositories");

describe("BundleService", () => {
    describe("createBundle", () => {
        it("should create bundle with valid data", async () => {
            const mockBundle = createMockBundle();
            (bundleRepository.countByShop as jest.Mock).mockResolvedValue(5);
            (bundleRepository.findByName as jest.Mock).mockResolvedValue(null);
            (bundleRepository.create as jest.Mock).mockResolvedValue(
                mockBundle,
            );

            const data = {
                name: "Test Bundle",
                type: "FIXED_BUNDLE" as const,
                discountType: "PERCENTAGE" as const,
                discountValue: 10,
                products: [{ productId: "prod-1", quantity: 1 }],
            };

            const result = await bundleService.createBundle(
                "test-shop.myshopify.com",
                data,
            );

            expect(result).toEqual(mockBundle);
        });

        it("should throw error if name already exists", async () => {
            const mockBundle = createMockBundle();
            (bundleRepository.countByShop as jest.Mock).mockResolvedValue(5);
            (bundleRepository.findByName as jest.Mock).mockResolvedValue(
                mockBundle,
            );

            const data = {
                name: "Test Bundle",
                type: "FIXED_BUNDLE" as const,
                discountType: "PERCENTAGE" as const,
                discountValue: 10,
                products: [{ productId: "prod-1", quantity: 1 }],
            };

            await expect(
                bundleService.createBundle("test-shop.myshopify.com", data),
            ).rejects.toThrow("A bundle with this name already exists");
        });

        it("should throw error if shop limit reached", async () => {
            (bundleRepository.countByShop as jest.Mock).mockResolvedValue(100);

            const data = {
                name: "Test Bundle",
                type: "FIXED_BUNDLE" as const,
                discountType: "PERCENTAGE" as const,
                discountValue: 10,
                products: [{ productId: "prod-1", quantity: 1 }],
            };

            await expect(
                bundleService.createBundle("test-shop.myshopify.com", data),
            ).rejects.toThrow(BusinessRuleError);
        });
    });
});
