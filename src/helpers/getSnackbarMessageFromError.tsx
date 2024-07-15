import { Trans } from '@lingui/macro';
import type { SnackbarMessage } from 'notistack';
import { UserRejectedRequestError } from 'viem';

import { FetchError } from '@/constants/error.js';
import { IS_PRODUCTION } from '@/constants/index.js';
import { getErrorMessageFromFetchError } from '@/helpers/getErrorMessageFromFetchError.js';

/**
 * Get a snackbar message from an error.
 * @param error
 * @param fallback the fallback message if error is not an instance of Error
 * @returns
 */
export function getSnackbarMessageFromError(error: unknown, fallback: string): SnackbarMessage {
    return error instanceof Error ? (
        error instanceof UserRejectedRequestError ? (
            <div>
                <span className="font-bold">
                    <Trans>Connection failed</Trans>
                </span>
                <br />
                <Trans>The user rejected the request.</Trans>
            </div>
        ) : error instanceof FetchError && IS_PRODUCTION ? (
            getErrorMessageFromFetchError(error)
        ) : (
            error.message
        )
    ) : (
        fallback
    );
}
