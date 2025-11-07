/**
 * Generic ID type
 */
export type ID = string;

/**
 * ISO date string
 */
export type ISODateString = string;

/**
 * Optional fields utility type
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields utility type
 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
    Required<Pick<T, K>>;

/**
 * Make all properties nullable
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

/**
 * Async function type
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * Generic callback type
 */
export type Callback<T = void> = (data: T) => void;