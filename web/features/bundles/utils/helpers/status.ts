import { bundleStatusConfigs } from "@/config";

export function getBundleStatusBadge(status: string) {
    const config =
        bundleStatusConfigs[status as keyof typeof bundleStatusConfigs] ?? {
            text: status,
            tone: "subdued",
        };

    return {
        tone: config.tone,
        children: config.text,
    };
}
