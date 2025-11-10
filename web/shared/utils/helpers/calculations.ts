import { customAlphabet } from "nanoid";

/**
 * Generate bundle ID
 */
export const generateBundleId = () => {
    const timestamp = Date.now().toString();
    const random = customAlphabet("0123456789", 4)(); // 4 digits (e.g., "1234")
    return `${timestamp}${random}`;
};
