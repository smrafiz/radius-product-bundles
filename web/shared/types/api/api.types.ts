export interface ApiResponse<T = any> {
    status: "success" | "error";
    data?: T;
    message?: string;
    errors?: string[];
}

export interface ApiError {
    status: "error";
    message: string;
    errors?: string[];
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
}
