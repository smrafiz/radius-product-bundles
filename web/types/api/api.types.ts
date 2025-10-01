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

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface FilterParams {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}
