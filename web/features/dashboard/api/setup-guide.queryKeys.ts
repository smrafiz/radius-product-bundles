export const setupGuideKeys = {
    all: ["setup-guide"] as const,
    progress: () => [...setupGuideKeys.all, "progress"] as const,
};
