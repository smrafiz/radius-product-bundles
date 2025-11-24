/**
 * Name Generator Utilities
 */

/**
 * Extract number from numbered name pattern
 */
export function extractNumberFromName(name: string): number {
    const match = name.match(/#(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate numbered name
 */
export function generateNumberedName(baseName: string, number: number): string {
    return `${baseName} #${number}`;
}

/**
 * Check if name matches a pattern
 */
export function isNameMatchingPattern(name: string, pattern: string): boolean {
    return name === pattern || name.startsWith(`${pattern} #`);
}

/**
 * Generate fallback name with timestamp
 */
export function generateFallbackName(baseName: string): string {
    const timestamp = Date.now().toString().slice(-4);
    return `${baseName} #${timestamp}`;
}
