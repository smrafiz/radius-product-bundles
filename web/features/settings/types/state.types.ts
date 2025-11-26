/**
 * Setting state types
 */

export interface SettingState {
    loading: boolean;
    error: string | null;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}