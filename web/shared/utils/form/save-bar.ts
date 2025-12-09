// Custom events
export const TRIGGER_SAVE_BAR = "form:trigger-save-bar";
export const SUBMIT_FORM = "form:submit";
export const VALIDATION_ERROR = "form:validation-error";

// Default form ID
export const DEFAULT_FORM_ID = "bundle";

// Track state per form ID
export const formStates: Record<
    string,
    { hasUnsavedChanges: boolean; isBlocked: boolean }
> = {};

/**
 * Gets or creates form state for a given ID.
 */
export const getFormState = (id: string) => {
    if (!formStates[id]) {
        formStates[id] = { hasUnsavedChanges: false, isBlocked: false };
    }
    return formStates[id];
};

/**
 * Blocks save bar triggers for a specific form.
 */
export function blockSaveBar(value: boolean, formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    state.isBlocked = value;
    if (value) {
        state.hasUnsavedChanges = false;
    }
}

/**
 * Triggers the Shopify save bar to appear.
 */
export function triggerSaveBar(formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    if (typeof window !== "undefined" && !state.isBlocked) {
        state.hasUnsavedChanges = true;
        window.dispatchEvent(
            new CustomEvent(TRIGGER_SAVE_BAR, { detail: { formId } }),
        );
    }
}

/**
 * Submits the form programmatically.
 */
export function submitForm(formId = DEFAULT_FORM_ID) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent(SUBMIT_FORM, { detail: { formId } }),
        );
    }
}

/**
 * Resets the save bar state for a form.
 */
export function resetSaveBar(formId = DEFAULT_FORM_ID) {
    const state = getFormState(formId);
    state.hasUnsavedChanges = false;
}
