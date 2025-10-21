/*
 * Remove null/undefined values from object
 */
export const removeNulls = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(removeNulls);
    }

    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, v]) => v !== null && v !== undefined)
                .map(([k, v]) => [k, removeNulls(v)]),
        );
    }

    return obj;
};
