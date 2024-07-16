import { Trans } from '@lingui/macro';
import type { SnackbarMessage } from 'notistack';
import { UserRejectedRequestError } from 'viem';

import { SnackbarErrorMessage } from '@/components/SnackbarErrorMessage.js';
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
        return (
            <SnackbarErrorMessage
                title={<Trans>Invalid signer key</Trans>}
                message={
                    <Trans>The signer is not authorized to perform the requested operation. Please login again.</Trans>
                }
            />
        );
    }

    if (error instanceof UserRejectedRequestError) {
        return (
            <SnackbarErrorMessage
                title={<Trans>Connection failed</Trans>}
                message={<Trans>The user rejected the request.</Trans>}
            />
        );
    }

    if (error instanceof FetchError && IS_PRODUCTION) {
        return getErrorMessageFromFetchError(error);
    }

    return error.message;
}
