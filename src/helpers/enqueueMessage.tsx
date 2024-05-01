import { type OptionsObject, type SnackbarKey, type SnackbarMessage } from 'notistack';

import { ErrorReportSnackbar } from '@/components/ErrorReportSnackbar.js';
import { SnackbarRef } from '@/modals/controls.js';

export function enqueueMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options,
    });
}

export function enqueueSuccessMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'success',
            ...options,
        },
    });
}

interface ErrorOptions extends OptionsObject {
    detail?: string;
}

export function enqueueErrorMessage(message: SnackbarMessage, options?: ErrorOptions) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'error',
            ...options,
            content: (key: SnackbarKey, message?: SnackbarMessage) => (
                <ErrorReportSnackbar id={key} message={message} detail={options?.detail} />
            ),
        },
    });
}
