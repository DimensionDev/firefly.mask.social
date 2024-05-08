import { type OptionsObject, type SnackbarKey, type SnackbarMessage } from 'notistack';

import { ErrorReportSnackbar } from '@/components/ErrorReportSnackbar.js';
import { getDetailedErrorMessage } from '@/helpers/getDetailedErrorMessage.js';
import { SnackbarRef } from '@/modals/controls.js';

export function enqueueInfoMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'info',
            ...options,
        },
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
    error?: unknown;
}

export function enqueueErrorMessage(message: SnackbarMessage, options?: ErrorOptions) {
    const detailedMessage = options?.error ? getDetailedErrorMessage(options.error) : '';

    SnackbarRef.open({
        message,
        options: {
            autoHideDuration: 15 * 1000, // 15s
            variant: 'error',
            ...options,
            content: (key: SnackbarKey, message?: SnackbarMessage) => (
                <ErrorReportSnackbar id={key} message={message} detail={detailedMessage} />
            ),
        },
    });
}

interface ErrorsOptions extends OptionsObject {
    errors?: unknown[];
}

export function enqueueErrorsMessage(message: SnackbarMessage, options?: ErrorsOptions) {
    const detailedMessage = options?.errors?.map(getDetailedErrorMessage).join('\n').trim();

    SnackbarRef.open({
        message,
        options: {
            autoHideDuration: 15 * 1000, // 15s
            variant: 'error',
            ...options,
            content: (key: SnackbarKey, message?: SnackbarMessage) => (
                <ErrorReportSnackbar id={key} message={message} detail={detailedMessage} />
            ),
        },
    });
}
