import { GlobalMessage } from "@/shared";

export interface UseGraphQLReturn<TResult> {
    data?: TResult;
    loading: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
}

export interface UseGraphQLOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean | "always";
    refetchOnWindowFocus?: boolean;
}

export type GlobalMessageOptions = Omit<
    GlobalMessage,
    "id" | "timestamp" | "type"
>;
