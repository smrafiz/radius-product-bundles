import { z } from "zod";

export const SetupProgressSchema = z
    .object({
        appEmbedEnabled: z.boolean(),
        firstBundleCreated: z.boolean(),
        widgetBlockAdded: z.boolean(),
        widgetCustomized: z.boolean(),
        storefrontPreviewed: z.boolean(),
        analyticsViewed: z.boolean(),
    })
    .strict();
