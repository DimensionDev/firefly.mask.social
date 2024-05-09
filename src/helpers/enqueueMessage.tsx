import { XMarkIcon } from '@heroicons/react/24/outline';
import { type OptionsObject, type SnackbarKey, type SnackbarMessage } from 'notistack';

import { ClickableButton } from '@/components/ClickableButton.js';
import { ErrorReportSnackbar, type ErrorReportSnackbarProps } from '@/components/ErrorReportSnackbar.js';
import { getDetailedErrorMessage } from '@/helpers/getDetailedErrorMessage.js';
import { SnackbarRef } from '@/modals/controls.js';

function snackbarAction(key: SnackbarKey) {
    return (
        <ClickableButton
            className="flex h-6 w-6 items-center justify-center"
            onClick={() => {
                SnackbarRef.close({ key });
            }}
        >
            <XMarkIcon width={20} height={20} />
        </ClickableButton>
    );
}

export function enqueueInfoMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'info',
            action: snackbarAction,
            ...options,
        },
    });
}

export function enqueueSuccessMessage(message: SnackbarMessage, options?: OptionsObject) {
    SnackbarRef.open({
        message,
        options: {
            variant: 'success',
            action: snackbarAction,
            ...options,
        },
    });
}

interface ErrorOptions extends OptionsObject, Pick<ErrorReportSnackbarProps, 'known'> {
    error?: unknown;
    /** If you don't want to display error stack */
    description?: string;
}

export function enqueueErrorMessage(message: SnackbarMessage, options?: ErrorOptions) {
    const detail = (options?.error ? getDetailedErrorMessage(options.error) : '') || options?.description || '';

    SnackbarRef.open({
        message,
        options: {
            autoHideDuration: 15 * 1000, // 15s
            variant: 'error',
            ...options,
            content: (key: SnackbarKey, message?: SnackbarMessage) => (
                <ErrorReportSnackbar id={key} message={message} detail={detail} known={options?.known} />
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
