import { cookies } from "next/headers";

type MessageValue = string | Record<string, unknown>;
type Messages = Record<string, Record<string, MessageValue>>;

export async function getTranslations(namespace: string) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    let messages: Messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch {
        messages = (await import("../../messages/en.json")).default;
    }

    const namespaceParts = namespace.split(".");
    let section: unknown = messages;
    for (const part of namespaceParts) {
        if (section && typeof section === "object" && part in section) {
            section = (section as Record<string, unknown>)[part];
        } else {
            section = {};
            break;
        }
    }

    const resolvedSection = (section || {}) as Record<string, unknown>;

    return (key: string, params?: Record<string, string | number>, defaultValue?: string) => {
        const parts = key.split(".");
        let value: unknown = resolvedSection;
        for (const part of parts) {
            if (value && typeof value === "object" && part in value) {
                value = (value as Record<string, unknown>)[part];
            } else {
                return defaultValue ?? key;
            }
        }

        if (typeof value !== "string") return defaultValue ?? key;

        if (params) {
            return value.replace(
                /\{(\w+)\}/g,
                (_, k) => String(params[k] ?? `{${k}}`),
            );
        }
        return value;
    };
}
