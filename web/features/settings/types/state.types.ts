/**
 * Setting state types
 */

export interface SettingState {
    loading: boolean;
    error: string | null;
    toast: { active: boolean; message: string };

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    showToast: (message: string) => void;
    hideToast: () => void;
}
