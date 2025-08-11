/**
 * Session-related utility functions
 */

/**
 * Generate a consistent session ID for offline sessions
 */
export function generateOfflineSessionId(shop: string): string {
    return `offline_${shop}`;
}

/**
 * Check if a session token is valid and not expired
 */
export function validateSessionToken(token: string | undefined): boolean {
    if (!token) return false;
    
    // Check if token has a valid format
    if (!token.startsWith('shpat_')) return false;
    
    // Additional validation can be added here
    return token.length > 20;
}

/**
 * Create a session configuration object
 */
export function createSessionConfig(shop: string, accessToken: string, scope: string, state?: string) {
    return {
        id: generateOfflineSessionId(shop),
        shop,
        accessToken,
        scope,
        isOnline: false,
        state: state || undefined,
    };
}

/**
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(name: string, fallback: string = ""): string {
    return process.env[name] || fallback;
}
