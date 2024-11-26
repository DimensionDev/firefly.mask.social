import { t, Trans } from '@lingui/macro';
import { ClientError } from 'graphql-request';
import { first } from 'lodash-es';
import type { SnackbarMessage } from 'notistack';
import { EstimateGasExecutionError, UserRejectedRequestError } from 'viem';

import { SnackbarErrorMessage } from '@/components/SnackbarErrorMessage.js';
import { FarcasterInvalidSignerKey, FetchError, UserRejectionError } from '@/constants/error.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromFetchError } from '@/helpers/getErrorMessageFromFetchError.js';

type SolanaError = {
    code: number;
    message: string;
};
function captureWarningMessageFromError(error: unknown) {
    let currentError = error;
    const visited = new Set();

    // For solana wallet adapter
    const message = 'user rejected the request';
    if (
        error instanceof Error &&
        (error.message?.toLowerCase().includes(message) ||
            ('error' in error && (error.error as SolanaError).message?.toLowerCase().includes(message)))
    ) {
        enqueueWarningMessage(t`The user rejected the request.`);
        return true;
    }

    // UserRejectedRequestError from viem
    while (currentError instanceof Error && !visited.has(currentError)) {
        visited.add(currentError);
        if (currentError instanceof UserRejectedRequestError) {
            enqueueWarningMessage(t`The user rejected the request.`);
            return true;
        }
        currentError = currentError.cause;
    }

    return false;
}

/**
 * Get a snackbar message from an error.
 * @param error
 * @param fallback the fallback message if error is not an instance of Error
 * @returns
 */
export function getSnackbarMessageFromError(error: unknown, fallback: string): SnackbarMessage {
    if (captureWarningMessageFromError(error)) {
        return '';
    }

    if (error instanceof ClientError) {
        const message = first(error.response.errors)?.message;
        if (message) return message;
    }

    if (error instanceof FetchError) {
        return getErrorMessageFromFetchError(error);
    }

    if (error instanceof FarcasterInvalidSignerKey) {
        return (
            <SnackbarErrorMessage
                title={<Trans>Invalid signer key</Trans>}
                message={
                    <Trans>
                        The signer is not authorized to perform the requested operation. Please approve again.
                    </Trans>
                }
            />
        );
    }

    if (error instanceof EstimateGasExecutionError) {
        return <SnackbarErrorMessage title={<Trans>Insufficient funds</Trans>} message={error.shortMessage} />;
    }

    if (error instanceof UserRejectionError) {
        return (
            <SnackbarErrorMessage
                title={<Trans>Canceled</Trans>}
                message={<Trans>The user canceled the operation.</Trans>}
            />
        );
    }

    return fallback;
}
