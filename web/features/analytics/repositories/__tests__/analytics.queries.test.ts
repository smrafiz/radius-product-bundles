import { startOfDay } from "date-fns";

const mockBundleViewCreate = jest.fn();
const mockBundleAnalyticsUpsert = jest.fn();

jest.mock("@/shared/repositories/prisma-connect", () => ({
    prisma: {
        bundleView: { create: mockBundleViewCreate },
        bundleAnalytics: { upsert: mockBundleAnalyticsUpsert },
    },
}));

jest.mock("date-fns", () => ({
    ...jest.requireActual("date-fns"),
}));

import { trackBundleView } from "../analytics.queries";

beforeEach(() => {
    jest.clearAllMocks();
    mockBundleViewCreate.mockResolvedValue({});
    mockBundleAnalyticsUpsert.mockResolvedValue({});
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
