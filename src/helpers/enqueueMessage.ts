import { type OptionsObject, type SnackbarMessage } from 'notistack';

import { SnackbarRef } from '@/modals/controls.js';

export function enqueueSuccessMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'success',
            ...options,
        },
    });
}

export function enqueueErrorMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'error',
            ...options,
        },
    });
}
