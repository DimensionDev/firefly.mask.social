import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { Source } from '@/constants/enum.js';
import { FarcasterInvalidSignerKey } from '@/constants/error.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { validateFarcasterSession } from '@/services/validateFarcasterSignerKey.js';

export function useCheckSessions() {
    const { availableSources } = useCompositePost();

    return useCallback(async () => {
        try {
            if (availableSources.includes(Source.Farcaster)) {
                await validateFarcasterSession(farcasterSessionHolder.sessionRequired);
            }
        } catch (error) {
            if (error instanceof FarcasterInvalidSignerKey) {
                enqueueErrorMessage(
                    getSnackbarMessageFromError(
                        error,
                        t`The signer is not authorized to perform the requested operation. Please approve again.`,
                    ),
                    {
                        error,
                    },
                );
                // indicate that the session is not valid
                return true;
            }

            throw error;
        }

        return false;
    }, [availableSources]);
}
