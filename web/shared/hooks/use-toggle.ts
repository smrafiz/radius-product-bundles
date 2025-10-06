import { useState, useCallback } from 'react';

/**
 * Toggle boolean state
 */
export function useToggle(
    initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue((v) => !v);
    }, []);

    return [value, toggle, setValue];
}