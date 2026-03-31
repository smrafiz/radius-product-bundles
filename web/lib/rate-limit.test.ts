import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
    it("allows requests within limit", () => {
        const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-a")).toBe(true);
    });

    it("blocks requests exceeding limit", () => {
        const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });

        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-a")).toBe(false);
    });

    it("tracks keys independently", () => {
        const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 });

        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-b")).toBe(true);
        expect(limiter("shop-a")).toBe(false);
        expect(limiter("shop-b")).toBe(false);
    });

    it("resets after window expires", () => {
        const limiter = createRateLimiter({ windowMs: 100, maxRequests: 1 });

        expect(limiter("shop-a")).toBe(true);
        expect(limiter("shop-a")).toBe(false);

        // Simulate time passing beyond window
        jest.useFakeTimers();
        jest.advanceTimersByTime(150);

        expect(limiter("shop-a")).toBe(true);
        jest.useRealTimers();
    });

    it("cleans up expired entries", () => {
        const limiter = createRateLimiter({
            windowMs: 100,
            maxRequests: 5,
            cleanupIntervalMs: 50,
        });

        limiter("shop-old");

        jest.useFakeTimers();
        jest.advanceTimersByTime(200);

        // Trigger cleanup by calling limiter after interval
        limiter("shop-new");

        // shop-old should have been cleaned up, verify new window works
        expect(limiter("shop-old")).toBe(true);
        jest.useRealTimers();
    });
});
