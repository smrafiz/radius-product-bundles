import { useState, useEffect } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';

export function useSessionToken() {
    const app = useAppBridge();
    const [sessionToken, setSessionToken] = useState<string>('');

    useEffect(() => {
        if (!app) return;

        const fetchToken = async () => {
            try {
                const token = await app.idToken();
                setSessionToken(token);
            } catch (error) {
                console.error('Failed to get session token:', error);
            }
        };

        void fetchToken();
    }, [app]);

    return sessionToken;
}