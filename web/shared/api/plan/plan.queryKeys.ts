export const planKeys = {
    all: ["plan"] as const,
    data: () => [...planKeys.all, "data"] as const,
};
