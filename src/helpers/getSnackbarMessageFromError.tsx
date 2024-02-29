import { Trans } from '@lingui/macro';
import type { SnackbarMessage } from 'notistack';

/**
 * Get a snackbar message from an error.
 * @param error
 * @param fallback the fallback message if error is not an instance of Error
 * @returns
 */
export function getSnackbarMessageFromError(error: unknown, fallback: string): SnackbarMessage {
    return error instanceof Error ? (
        error.name === 'UserRejectedRequestError' ? (
            <div>
                <span className="font-bold">
                    <Trans>Connection failed</Trans>
                </span>
                <br />
                <Trans>The user declined the request.</Trans>
            </div>
        ) : error.message.startsWith('NotAllowed') ? (
            <Trans>Please switch to the wallet used for login</Trans>
        ) : (
            error.message
        )
    ) : (
        fallback
    );
}
