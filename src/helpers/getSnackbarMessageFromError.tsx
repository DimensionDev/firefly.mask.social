import { t, Trans } from '@lingui/macro';
import type { SnackbarMessage } from 'notistack';
import { UserRejectedRequestError } from 'viem';

import { FetchError, UnauthorizedError } from '@/constants/error.js';
import { IS_PRODUCTION } from '@/constants/index.js';
import { getErrorMessageFromFetchError } from '@/helpers/getErrorMessageFromFetchError.js';

/**
 * Get a snackbar message from an error.
 * @param error
 * @param fallback the fallback message if error is not an instance of Error
 * @returns
 */
export function getSnackbarMessageFromError(error: unknown, fallback: string): SnackbarMessage {
    if (!(error instanceof Error)) return fallback;

    if (error instanceof UnauthorizedError) {
        return t`The signer is not authorized to perform the requested operation. Please login again.`;
    }

    if (error instanceof UserRejectedRequestError) {
        return (
            <div>
                <span className="font-bold">
                    <Trans>Connection failed</Trans>
                </span>
                <br />
                <Trans>The user rejected the request.</Trans>
            </div>
        );
    }

    if (error instanceof FetchError && IS_PRODUCTION) {
        return getErrorMessageFromFetchError(error);
    }

    return error.message;
}
