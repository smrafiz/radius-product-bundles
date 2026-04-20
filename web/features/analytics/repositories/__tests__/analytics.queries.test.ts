import { startOfDay } from "date-fns";

const mockBundleViewCreate = jest.fn();
const mockBundleAnalyticsUpsert = jest.fn();
const mockBundleAnalyticsDeleteMany = jest.fn();
const mockAutomationLogDeleteMany = jest.fn();

jest.mock("@/shared/repositories/prisma-connect", () => ({
    prisma: {
        bundleView: { create: mockBundleViewCreate },
        bundleAnalytics: {
            upsert: mockBundleAnalyticsUpsert,
            deleteMany: mockBundleAnalyticsDeleteMany,
        },
        automationLog: { deleteMany: mockAutomationLogDeleteMany },
    },
}));

jest.mock("date-fns", () => ({
    ...jest.requireActual("date-fns"),
}));

import { trackBundleView, pruneAnalytics, pruneAutomationLogs } from "../analytics.queries";

beforeEach(() => {
    jest.clearAllMocks();
    mockBundleViewCreate.mockResolvedValue({});
    mockBundleAnalyticsUpsert.mockResolvedValue({});
    mockBundleAnalyticsDeleteMany.mockResolvedValue({ count: 0 });
    mockAutomationLogDeleteMany.mockResolvedValue({ count: 0 });
});

describe("trackBundleView", () => {
    const timestamp = new Date("2026-04-20T14:30:00.000Z");
    const expectedDate = startOfDay(timestamp);

    describe("bundleView.create date field", () => {
        it("passes a Date object for date (not a string) — customerId path", async () => {
            await trackBundleView("bundle-1", timestamp, "customer-1");

            expect(mockBundleViewCreate).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    date: expect.any(Date),
                }),
            });
        });

        it("passes a Date object for date (not a string) — sessionId path", async () => {
            await trackBundleView("bundle-1", timestamp, undefined, "session-1");

            expect(mockBundleViewCreate).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    date: expect.any(Date),
                }),
            });
        });

        it("date is start-of-day (time stripped)", async () => {
            await trackBundleView("bundle-1", timestamp, "customer-1");

            const call = mockBundleViewCreate.mock.calls[0][0];
            expect(call.data.date).toEqual(expectedDate);
        });

        it("string timestamp is normalised to Date before write", async () => {
            await trackBundleView("bundle-1", "2026-04-20T14:30:00.000Z", "customer-1");

            const call = mockBundleViewCreate.mock.calls[0][0];
            expect(call.data.date).toBeInstanceOf(Date);
        });
    });

    describe("dedup behaviour (P2002 / P2003)", () => {
        it("swallows P2002 unique violation silently", async () => {
            const err = Object.assign(new Error("Unique"), { code: "P2002" });
            mockBundleViewCreate.mockRejectedValueOnce(err);

            await expect(
                trackBundleView("bundle-1", timestamp, "customer-1"),
            ).resolves.toBeUndefined();
        });

        it("swallows P2003 FK violation silently", async () => {
            const err = Object.assign(new Error("FK"), { code: "P2003" });
            mockBundleViewCreate.mockRejectedValueOnce(err);

            await expect(
                trackBundleView("bundle-1", timestamp, "customer-1"),
            ).resolves.toBeUndefined();
        });

        it("re-throws unexpected errors", async () => {
            const err = Object.assign(new Error("DB down"), { code: "P9999" });
            mockBundleViewCreate.mockRejectedValueOnce(err);

            await expect(
                trackBundleView("bundle-1", timestamp, "customer-1"),
            ).rejects.toThrow("DB down");
        });
    });
});

describe("pruneAnalytics", () => {
    it("deletes bundle_analytics rows older than the given days", async () => {
        mockBundleAnalyticsDeleteMany.mockResolvedValueOnce({ count: 42 });

        const result = await pruneAnalytics(730);

        expect(result).toBe(42);
        expect(mockBundleAnalyticsDeleteMany).toHaveBeenCalledWith({
            where: { date: { lt: expect.any(Date) } },
        });
    });

    it("cutoff date is approximately N days ago", async () => {
        const before = new Date();
        await pruneAnalytics(730);
        const after = new Date();

        const call = mockBundleAnalyticsDeleteMany.mock.calls[0][0];
        const cutoff: Date = call.where.date.lt;

        const expectedMs = 730 * 24 * 60 * 60 * 1000;
        expect(before.getTime() - cutoff.getTime()).toBeGreaterThanOrEqual(expectedMs - 1000);
        expect(after.getTime() - cutoff.getTime()).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it("returns 0 when nothing to prune", async () => {
        mockBundleAnalyticsDeleteMany.mockResolvedValueOnce({ count: 0 });
        expect(await pruneAnalytics(730)).toBe(0);
    });
});

describe("pruneAutomationLogs", () => {
    it("deletes automation_logs rows older than the given days", async () => {
        mockAutomationLogDeleteMany.mockResolvedValueOnce({ count: 7 });

        const result = await pruneAutomationLogs(90);

        expect(result).toBe(7);
        expect(mockAutomationLogDeleteMany).toHaveBeenCalledWith({
            where: { createdAt: { lt: expect.any(Date) } },
        });
    });

    it("cutoff date is approximately N days ago", async () => {
        const before = new Date();
        await pruneAutomationLogs(90);
        const after = new Date();

        const call = mockAutomationLogDeleteMany.mock.calls[0][0];
        const cutoff: Date = call.where.createdAt.lt;

        const expectedMs = 90 * 24 * 60 * 60 * 1000;
        expect(before.getTime() - cutoff.getTime()).toBeGreaterThanOrEqual(expectedMs - 1000);
        expect(after.getTime() - cutoff.getTime()).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it("returns 0 when nothing to prune", async () => {
        mockAutomationLogDeleteMany.mockResolvedValueOnce({ count: 0 });
        expect(await pruneAutomationLogs(90)).toBe(0);
    });
});
